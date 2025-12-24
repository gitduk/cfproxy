/**
 * Cloudflare Worker HTTP/HTTPS Proxy - Enhanced Version
 * 功能完整的代理服务，支持多种访问方式
 * 版本：2.0.0
 */

// ==================== 配置区域 ====================
const CONFIG = {
  VERSION: '2.0.0',
  
  // 限流配置
  RATE_LIMIT: {
    ENABLED: true,
    MAX_REQUESTS: 100,      // 每个 IP 每分钟最大请求数
    WINDOW_MS: 60000        // 时间窗口（毫秒）
  },
  
  // 缓存配置
  CACHE: {
    ENABLED: true,
    TTL: 3600,              // 缓存时间（秒）
    CACHE_EVERYTHING: true
  },
  
  // 安全配置
  SECURITY: {
    BLOCKED_HOSTS: [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      '10.',              // 10.0.0.0/8
      '172.16.',          // 172.16.0.0/12
      '192.168.',         // 192.168.0.0/16
      '169.254.169.254',  // AWS metadata
      '::1',
      'metadata.google.internal'
    ],
    REMOVE_HEADERS: [
      'cf-connecting-ip',
      'cf-ipcountry',
      'cf-ray',
      'cf-visitor',
      'cf-worker',
      'x-forwarded-for',
      'x-forwarded-proto',
      'x-real-ip',
      'x-api-key'         // 不要转发我们的认证头
    ]
  }
};

// 限流存储（内存中）
const rateLimitMap = new Map();

// ==================== 主入口 ====================
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    try {
      // 1. 健康检查端点
      if (url.pathname === '/health') {
        return jsonResponse({
          status: 'healthy',
          version: CONFIG.VERSION,
          timestamp: new Date().toISOString()
        });
      }

      // 2. API Key 验证（如果配置了 SECRET）
      const authResult = checkAuth(request, env);
      if (!authResult.success) {
        return jsonResponse({ error: authResult.error }, 401);
      }

      // 3. 限流检查
      if (CONFIG.RATE_LIMIT.ENABLED) {
        const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
        if (!checkRateLimit(ip)) {
          return jsonResponse(
            { 
              error: 'Rate limit exceeded',
              message: `Maximum ${CONFIG.RATE_LIMIT.MAX_REQUESTS} requests per minute`
            },
            429,
            { 'Retry-After': '60' }
          );
        }
      }

      // 4. CORS 预检
      if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders() });
      }

      // 5. 根路径 - 返回 Web UI
      if (url.pathname === '/' || url.pathname === '') {
        return new Response(getRootHtml(), {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            ...corsHeaders()
          }
        });
      }

      // 6. CONNECT 方法不支持
      if (request.method === 'CONNECT') {
        return jsonResponse(
          { 
            error: 'CONNECT method not supported',
            message: 'Please use standard HTTP proxy mode'
          },
          501
        );
      }

      // 7. 处理代理请求
      return await handleProxyRequest(request, url, env);

    } catch (error) {
      console.error('[Fatal Error]', error);
      return errorResponse(error, 500);
    }
  }
};

// ==================== 认证检查 ====================
function checkAuth(request, env) {
  const secret = env.SECRET;
  
  // 如果没有设置 SECRET，允许所有请求（开发模式）
  if (!secret) {
    console.warn('[Security Warning] SECRET not set. All requests allowed.');
    return { success: true };
  }
  
  const apiKey = request.headers.get('X-API-Key');
  
  if (!apiKey) {
    return { 
      success: false, 
      error: 'Missing X-API-Key header' 
    };
  }
  
  if (apiKey !== secret) {
    return { 
      success: false, 
      error: 'Invalid API Key' 
    };
  }
  
  return { success: true };
}

// ==================== 限流检查 ====================
function checkRateLimit(ip) {
  const now = Date.now();
  const { MAX_REQUESTS, WINDOW_MS } = CONFIG.RATE_LIMIT;
  
  // 清理过期记录（简单实现）
  if (rateLimitMap.size > 10000) {
    rateLimitMap.clear();
  }
  
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return true;
  }
  
  const record = rateLimitMap.get(ip);
  
  // 时间窗口已过，重置计数
  if (now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return true;
  }
  
  // 超过限制
  if (record.count >= MAX_REQUESTS) {
    return false;
  }
  
  // 增加计数
  record.count++;
  return true;
}

// ==================== URL 安全检查 ====================
function isUrlSafe(targetUrl) {
  try {
    const url = new URL(targetUrl);
    const hostname = url.hostname.toLowerCase();
    
    // 检查是否在黑名单中
    for (const blocked of CONFIG.SECURITY.BLOCKED_HOSTS) {
      if (hostname === blocked || hostname.startsWith(blocked)) {
        return { 
          safe: false, 
          reason: `Access to ${hostname} is blocked for security reasons` 
        };
      }
    }
    
    // 只允许 http 和 https
    if (!['http:', 'https:'].includes(url.protocol)) {
      return { 
        safe: false, 
        reason: `Protocol ${url.protocol} is not supported` 
      };
    }
    
    return { safe: true };
  } catch (error) {
    return { 
      safe: false, 
      reason: 'Invalid URL format' 
    };
  }
}

// ==================== 代理请求处理 ====================
async function handleProxyRequest(request, url, env) {
  try {
    // 1. 解析目标 URL
    let targetUrl = extractTargetUrl(request, url);
    
    if (!targetUrl) {
      return jsonResponse({
        error: 'No target URL provided',
        usage: {
          web: 'Visit / for Web UI',
          method1: '?url=https://example.com',
          method2: '/https://example.com or /example.com',
          method3: 'Set as HTTP_PROXY in environment'
        },
        documentation: url.origin
      }, 400);
    }

    // 2. 验证 URL 格式
    let target;
    try {
      target = new URL(targetUrl);
    } catch (e) {
      return jsonResponse({
        error: 'Invalid target URL',
        provided: targetUrl,
        message: e.message
      }, 400);
    }

    // 3. 安全检查
    const safetyCheck = isUrlSafe(targetUrl);
    if (!safetyCheck.safe) {
      return jsonResponse({
        error: 'URL blocked',
        reason: safetyCheck.reason,
        url: targetUrl
      }, 403);
    }

    // 4. 构建代理请求
    const proxyHeaders = cleanHeaders(request.headers);
    
    const requestInit = {
      method: request.method,
      headers: proxyHeaders,
      body: ['GET', 'HEAD'].includes(request.method) ? null : request.body,
      redirect: 'manual'
    };
    
    // 5. 添加缓存配置
    if (CONFIG.CACHE.ENABLED && request.method === 'GET') {
      requestInit.cf = {
        cacheTtl: CONFIG.CACHE.TTL,
        cacheEverything: CONFIG.CACHE.CACHE_EVERYTHING,
        cacheKey: target.toString()
      };
    }

    const proxyRequest = new Request(target, requestInit);

    // 6. 发起请求
    console.log(`[Proxy] ${request.method} ${target.toString()}`);
    const response = await fetch(proxyRequest);

    // 7. 处理重定向
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location');
      if (location) {
        const absoluteLocation = new URL(location, target).toString();
        const proxyLocation = `${url.origin}/${encodeURIComponent(absoluteLocation)}`;
        
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: {
            ...Object.fromEntries(response.headers),
            'Location': proxyLocation,
            ...corsHeaders(),
            ...noCacheHeaders()
          }
        });
      }
    }

    // 8. 处理 HTML 内容中的相对路径
    let body = response.body;
    const contentType = response.headers.get('Content-Type') || '';
    
    if (contentType.includes('text/html')) {
      const originalText = await response.text();
      body = rewriteHtmlUrls(originalText, url.origin, target);
    }

    // 9. 返回响应
    const responseHeaders = new Headers(response.headers);
    
    // 添加 CORS 头
    Object.entries(corsHeaders()).forEach(([key, value]) => {
      responseHeaders.set(key, value);
    });
    
    // 对于 HTML，禁用缓存
    if (contentType.includes('text/html')) {
      Object.entries(noCacheHeaders()).forEach(([key, value]) => {
        responseHeaders.set(key, value);
      });
    }

    return new Response(body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders
    });

  } catch (error) {
    console.error('[Proxy Error]', error);
    return errorResponse(error, 502);
  }
}

// ==================== 提取目标 URL ====================
function extractTargetUrl(request, url) {
  // 方式 1: 查询参数 ?url=https://example.com
  let targetUrl = url.searchParams.get('url');
  if (targetUrl) return targetUrl;

  // 方式 2: 路径方式 /https://example.com 或 /example.com
  if (url.pathname !== '/') {
    let path = decodeURIComponent(url.pathname.substring(1));

    // 如果路径已经包含协议
    if (path.startsWith('http://') || path.startsWith('https://')) {
      targetUrl = path;
    } else {
      // 自动添加 https 协议
      targetUrl = 'https://' + path;
    }

    // 保留查询参数
    if (url.search) {
      targetUrl += url.search;
    }
    
    return targetUrl;
  }

  // 方式 3: 标准 HTTP 代理模式
  const host = request.headers.get('Host');
  if (host && !url.hostname.includes(host)) {
    return request.url;
  }

  return null;
}

// ==================== HTML URL 重写 ====================
function rewriteHtmlUrls(html, proxyOrigin, targetUrl) {
  const origin = targetUrl.origin;
  
  // 替换绝对路径：href="/" src="/" action="/"
  let modified = html.replace(
    /((href|src|action)=["'])\/((?!\/))/gi,
    `$1${proxyOrigin}/${origin}/$3`
  );
  
  // 替换相对协议：href="//" src="//"
  modified = modified.replace(
    /((href|src|action)=["'])\/\//gi,
    `$1${proxyOrigin}/https://`
  );
  
  return modified;
}

// ==================== 清理请求头 ====================
function cleanHeaders(headers) {
  const cleaned = new Headers(headers);

  // 移除不应转发的头
  CONFIG.SECURITY.REMOVE_HEADERS.forEach(header => {
    cleaned.delete(header);
  });

  // 设置合理的 User-Agent
  if (!cleaned.has('User-Agent')) {
    cleaned.set(
      'User-Agent',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
  }

  return cleaned;
}

// ==================== 响应辅助函数 ====================
function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(),
      ...extraHeaders
    }
  });
}

function errorResponse(error, status = 500) {
  console.error(`[Error ${status}]`, error);
  
  return jsonResponse({
    error: error.message || 'Internal server error',
    status: status,
    timestamp: new Date().toISOString(),
    version: CONFIG.VERSION
  }, status);
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Max-Age': '86400'
  };
}

function noCacheHeaders() {
  return {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  };
}

// ==================== Web UI HTML ====================
function getRootHtml() {
  return `<!DOCTYPE html>
<html lang="zh-CN" class="h-full">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cloudflare Proxy - 全功能代理服务</title>
  <meta name="description" content="基于 Cloudflare Workers 的全功能 HTTP/HTTPS 代理服务">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌐</text></svg>">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            zinc: {
              50: '#fafafa', 100: '#f4f4f5', 200: '#e4e4e7', 300: '#d4d4d8',
              400: '#a1a1aa', 500: '#71717a', 600: '#52525b', 700: '#3f3f46',
              800: '#27272a', 900: '#18181b',
            },
            teal: { 400: '#2dd4bf', 500: '#14b8a6', 600: '#0d9488' }
          }
        }
      }
    }
  </script>
  <style>
    :root {
      --bg-primary: #fafafa;
      --bg-secondary: #ffffff;
      --text-primary: #27272a;
      --text-secondary: #52525b;
      --border-color: #e4e4e7;
      --accent-color: #14b8a6;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg-primary: #000000;
        --bg-secondary: #18181b;
        --text-primary: #f4f4f5;
        --text-secondary: #a1a1aa;
        --border-color: rgba(63, 63, 70, 0.4);
        --accent-color: #2dd4bf;
      }
    }
    body { background-color: var(--bg-primary); color: var(--text-primary); }
    .code-block { 
      position: relative; 
      padding-right: 60px; 
    }
    .copy-btn {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      padding: 4px 12px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .copy-btn:hover { opacity: 0.8; }
    .copied { background-color: #10b981 !important; }
  </style>
</head>
<body class="flex h-full flex-col">
  <div class="flex w-full flex-col">
    <div class="relative flex w-full flex-col bg-white ring-1 ring-zinc-100 dark:bg-zinc-900 dark:ring-zinc-300/20">
      <main class="flex-auto">
        <div class="sm:px-8 mt-16 sm:mt-32">
          <div class="mx-auto w-full max-w-7xl lg:px-8">
            <div class="relative px-4 sm:px-8 lg:px-12">
              <div class="mx-auto max-w-2xl lg:max-w-5xl">

                <!-- 标题区域 -->
                <div class="max-w-2xl">
                  <div class="text-6xl mb-6">🌐</div>
                  <h1 class="text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl dark:text-zinc-100">
                    Cloudflare Proxy
                  </h1>
                  <p class="mt-6 text-base text-zinc-600 dark:text-zinc-400">
                    基于 Cloudflare Workers 的全功能 HTTP/HTTPS 代理服务，支持多种访问方式，完全免费且易于使用。
                  </p>
                </div>

                <!-- 表单卡片 -->
                <div class="mt-16 rounded-2xl border border-zinc-100 p-6 dark:border-zinc-700/40">
                  <form id="urlForm" class="space-y-4">
                    <div>
                      <label for="targetUrl" class="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                        输入目标网址
                      </label>
                      <input
                        type="text"
                        id="targetUrl"
                        placeholder="example.com 或 https://example.com"
                        required
                        class="w-full rounded-md bg-white px-4 py-2 text-sm text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-teal-500 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-zinc-700 dark:placeholder:text-zinc-500"
                      >
                    </div>
                    <button
                      type="submit"
                      class="w-full rounded-md bg-zinc-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:bg-teal-500 dark:hover:bg-teal-400"
                    >
                      开始代理
                    </button>
                  </form>
                </div>

                <!-- 使用方式 -->
                <div class="mt-16 rounded-2xl border border-zinc-100 p-6 dark:border-zinc-700/40">
                  <h2 class="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                    🚀 使用方式
                  </h2>
                  <div class="space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
                    <div class="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/50">
                      <div class="font-medium text-zinc-900 dark:text-zinc-100 mb-2">方式 1: Web 界面</div>
                      <p>在上方输入框输入目标网址即可</p>
                    </div>
                    <div class="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/50">
                      <div class="font-medium text-zinc-900 dark:text-zinc-100 mb-2">方式 2: 查询参数</div>
                      <div class="code-block">
                        <code class="text-xs text-teal-600 dark:text-teal-400 break-all" id="method2"></code>
                        <button onclick="copyCode('method2')" class="copy-btn rounded bg-teal-500 text-white">复制</button>
                      </div>
                    </div>
                    <div class="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/50">
                      <div class="font-medium text-zinc-900 dark:text-zinc-100 mb-2">方式 3: 路径方式</div>
                      <div class="code-block">
                        <code class="text-xs text-teal-600 dark:text-teal-400 break-all" id="method3"></code>
                        <button onclick="copyCode('method3')" class="copy-btn rounded bg-teal-500 text-white">复制</button>
                      </div>
                    </div>
                    <div class="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/50">
                      <div class="font-medium text-zinc-900 dark:text-zinc-100 mb-2">方式 4: HTTP 代理</div>
                      <div class="code-block">
                        <code class="text-xs text-teal-600 dark:text-teal-400 break-all" id="method4"></code>
                        <button onclick="copyCode('method4')" class="copy-btn rounded bg-teal-500 text-white">复制</button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 使用场景 -->
                <div class="mt-16 rounded-2xl border border-zinc-100 p-6 dark:border-zinc-700/40">
                  <h2 class="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                    💡 使用场景
                  </h2>
                  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div class="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/50">
                      <div class="font-medium text-zinc-900 dark:text-zinc-100 mb-2">📦 GitHub 文件加速</div>
                      <p class="text-sm text-zinc-600 dark:text-zinc-400 mb-2">加速 raw.githubusercontent.com 文件下载</p>
                      <div class="code-block">
                        <code class="text-xs text-teal-600 dark:text-teal-400 break-all" id="scene1"></code>
                        <button onclick="copyCode('scene1')" class="copy-btn rounded bg-teal-500 text-white text-xs">复制</button>
                      </div>
                    </div>
                    <div class="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/50">
                      <div class="font-medium text-zinc-900 dark:text-zinc-100 mb-2">🐳 Docker 镜像加速</div>
                      <p class="text-sm text-zinc-600 dark:text-zinc-400 mb-2">配置 Docker 镜像代理源</p>
                      <div class="code-block">
                        <code class="text-xs text-teal-600 dark:text-teal-400 break-all" id="scene2"></code>
                        <button onclick="copyCode('scene2')" class="copy-btn rounded bg-teal-500 text-white text-xs">复制</button>
                      </div>
                    </div>
                    <div class="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/50">
                      <div class="font-medium text-zinc-900 dark:text-zinc-100 mb-2">🤖 API 代理</div>
                      <p class="text-sm text-zinc-600 dark:text-zinc-400 mb-2">代理第三方 API 请求</p>
                      <div class="code-block">
                        <code class="text-xs text-teal-600 dark:text-teal-400 break-all" id="scene3"></code>
                        <button onclick="copyCode('scene3')" class="copy-btn rounded bg-teal-500 text-white text-xs">复制</button>
                      </div>
                    </div>
                    <div class="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/50">
                      <div class="font-medium text-zinc-900 dark:text-zinc-100 mb-2">🌍 CORS 代理</div>
                      <p class="text-sm text-zinc-600 dark:text-zinc-400 mb-2">解决前端跨域问题</p>
                      <div class="code-block">
                        <code class="text-xs text-teal-600 dark:text-teal-400 break-all" id="scene4"></code>
                        <button onclick="copyCode('scene4')" class="copy-btn rounded bg-teal-500 text-white text-xs">复制</button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 功能特性 -->
                <div class="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div class="flex items-center text-sm text-zinc-600 dark:text-zinc-400">
                    <svg class="w-5 h-5 mr-2 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    HTTPS 支持
                  </div>
                  <div class="flex items-center text-sm text-zinc-600 dark:text-zinc-400">
                    <svg class="w-5 h-5 mr-2 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    CORS 跨域
                  </div>
                  <div class="flex items-center text-sm text-zinc-600 dark:text-zinc-400">
                    <svg class="w-5 h-5 mr-2 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    智能缓存
                  </div>
                  <div class="flex items-center text-sm text-zinc-600 dark:text-zinc-400">
                    <svg class="w-5 h-5 mr-2 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    安全限流
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- 页脚 -->
      <footer class="mt-32">
        <div class="sm:px-8">
          <div class="mx-auto w-full max-w-7xl lg:px-8">
            <div class="border-t border-zinc-100 pt-10 pb-16 dark:border-zinc-700/40">
              <div class="relative px-4 sm:px-8 lg:px-12">
                <div class="mx-auto max-w-2xl lg:max-w-5xl">
                  <div class="flex flex-col items-center justify-between gap-6 sm:flex-row">
                    <p class="text-sm text-zinc-400 dark:text-zinc-500">
                      Powered by Cloudflare Workers • Version ${CONFIG.VERSION}
                    </p>
                    <div class="flex items-center space-x-4">
                      <a href="/health" target="_blank" class="text-sm text-zinc-600 hover:text-teal-500 dark:text-zinc-400">
                        健康检查
                      </a>
                      <a href="https://github.com" target="_blank" class="text-sm text-zinc-600 hover:text-teal-500 dark:text-zinc-400">
                        GitHub
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  </div>

  <script>
    const currentOrigin = window.location.origin;

    // 填充示例
    document.getElementById('method2').textContent = currentOrigin + '/?url=https://example.com';
    document.getElementById('method3').textContent = currentOrigin + '/https://example.com';
    document.getElementById('method4').textContent = 'export HTTP_PROXY=' + currentOrigin;
    document.getElementById('scene1').textContent = currentOrigin + '/https://raw.githubusercontent.com/user/repo/main/file.txt';
    document.getElementById('scene2').textContent = currentOrigin + '/https://registry-1.docker.io';
    document.getElementById('scene3').textContent = currentOrigin + '/https://api.openai.com/v1/chat/completions';
    document.getElementById('scene4').textContent = 'fetch("' + currentOrigin + '/https://api.example.com/data")';

    // 复制功能
    function copyCode(elementId) {
      const text = document.getElementById(elementId).textContent;
      const button = event.target;
      
      navigator.clipboard.writeText(text).then(() => {
        const originalText = button.textContent;
        button.textContent = '已复制!';
        button.classList.add('copied');
        
        setTimeout(() => {
          button.textContent = originalText;
          button.classList.remove('copied');
        }, 2000);
      }).catch(err => {
        alert('复制失败: ' + err);
      });
    }

    // 表单提交
    document.getElementById('urlForm').addEventListener('submit', function(event) {
      event.preventDefault();
      let targetUrl = document.getElementById('targetUrl').value.trim();

      if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = 'https://' + targetUrl;
      }

      const proxyUrl = currentOrigin + '/' + encodeURIComponent(targetUrl);
      window.open(proxyUrl, '_blank');
    });
  </script>
</body>
</html>`;
}
