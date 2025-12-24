/**
 * Cloudflare Worker HTTP/HTTPS Proxy - Enhanced Version
 * 版本：2.0.0
 */

// 导入 UI
import { getHtml } from "./ui.js";

// ==================== 配置区域 ====================
const CONFIG = {
  VERSION: "2.0.0",

  // 限流配置
  RATE_LIMIT: {
    ENABLED: true,
    MAX_REQUESTS: 100, // 每个 IP 每分钟最大请求数
    WINDOW_MS: 60000, // 时间窗口（毫秒）
  },

  // 缓存配置
  CACHE: {
    ENABLED: true,
    TTL: 3600, // 缓存时间（秒）
    CACHE_EVERYTHING: true,
  },

  // 安全配置
  SECURITY: {
    BLOCKED_HOSTS: [
      "localhost",
      "127.0.0.1",
      "0.0.0.0",
      "10.", // 10.0.0.0/8
      "172.16.", // 172.16.0.0/12
      "192.168.", // 192.168.0.0/16
      "169.254.169.254", // AWS metadata
      "::1",
      "metadata.google.internal",
    ],
    REMOVE_HEADERS: [
      "cf-connecting-ip",
      "cf-ipcountry",
      "cf-ray",
      "cf-visitor",
      "cf-worker",
      "x-forwarded-for",
      "x-forwarded-proto",
      "x-real-ip",
      "x-api-key", // 不要转发我们的认证头
    ],
  },
};

// 限流存储（内存中）
const rateLimitMap = new Map();

// ==================== 主入口 ====================
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    try {
      // 1. 健康检查端点
      if (url.pathname === "/health") {
        return jsonResponse({
          status: "healthy",
          version: CONFIG.VERSION,
          timestamp: new Date().toISOString(),
        });
      }

      // 2. API Key 验证（如果配置了 SECRET）
      const authResult = checkAuth(request, env);
      if (!authResult.success) {
        return jsonResponse({ error: authResult.error }, 401);
      }

      // 3. 限流检查
      if (CONFIG.RATE_LIMIT.ENABLED) {
        const ip = request.headers.get("CF-Connecting-IP") || "unknown";
        if (!checkRateLimit(ip)) {
          return jsonResponse(
            {
              error: "Rate limit exceeded",
              message: `Maximum ${CONFIG.RATE_LIMIT.MAX_REQUESTS} requests per minute`,
            },
            429,
            { "Retry-After": "60" },
          );
        }
      }

      // 4. CORS 预检
      if (request.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders() });
      }

      // 5. 根路径 - 返回 Web UI
      if (url.pathname === "/" || url.pathname === "") {
        return new Response(getHtml(CONFIG), {
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            ...corsHeaders(),
          },
        });
      }

      // 6. CONNECT 方法不支持
      if (request.method === "CONNECT") {
        return jsonResponse(
          {
            error: "CONNECT method not supported",
            message: "Please use standard HTTP proxy mode",
          },
          501,
        );
      }

      // 7. 处理代理请求
      return await handleProxyRequest(request, url, env);
    } catch (error) {
      console.error("[Fatal Error]", error);
      return errorResponse(error, 500);
    }
  },
};

// ==================== 认证检查 ====================
function checkAuth(request, env) {
  const secret = env.SECRET;

  // 如果没有设置 SECRET，允许所有请求（开发模式）
  if (!secret) {
    console.warn("[Security Warning] SECRET not set. All requests allowed.");
    return { success: true };
  }

  const apiKey = request.headers.get("X-API-Key");

  if (!apiKey) {
    return {
      success: false,
      error: "Missing X-API-Key header",
    };
  }

  if (apiKey !== secret) {
    return {
      success: false,
      error: "Invalid API Key",
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
          reason: `Access to ${hostname} is blocked for security reasons`,
        };
      }
    }

    // 只允许 http 和 https
    if (!["http:", "https:"].includes(url.protocol)) {
      return {
        safe: false,
        reason: `Protocol ${url.protocol} is not supported`,
      };
    }

    return { safe: true };
  } catch (error) {
    return {
      safe: false,
      reason: "Invalid URL format",
    };
  }
}

// ==================== 代理请求处理 ====================
async function handleProxyRequest(request, url, env) {
  try {
    // 1. 解析目标 URL
    let targetUrl = extractTargetUrl(request, url);

    if (!targetUrl) {
      return jsonResponse(
        {
          error: "No target URL provided",
          usage: {
            web: "Visit / for Web UI",
            method1: "?url=https://example.com",
            method2: "/https://example.com or /example.com",
            method3: "Set as HTTP_PROXY in environment",
          },
          documentation: url.origin,
        },
        400,
      );
    }

    // 2. 验证 URL 格式
    let target;
    try {
      target = new URL(targetUrl);
    } catch (e) {
      return jsonResponse(
        {
          error: "Invalid target URL",
          provided: targetUrl,
          message: e.message,
        },
        400,
      );
    }

    // 3. 安全检查
    const safetyCheck = isUrlSafe(targetUrl);
    if (!safetyCheck.safe) {
      return jsonResponse(
        {
          error: "URL blocked",
          reason: safetyCheck.reason,
          url: targetUrl,
        },
        403,
      );
    }

    // 4. 构建代理请求
    const proxyHeaders = cleanHeaders(request.headers);

    const requestInit = {
      method: request.method,
      headers: proxyHeaders,
      body: ["GET", "HEAD"].includes(request.method) ? null : request.body,
      redirect: "manual",
    };

    // 5. 添加缓存配置
    if (CONFIG.CACHE.ENABLED && request.method === "GET") {
      requestInit.cf = {
        cacheTtl: CONFIG.CACHE.TTL,
        cacheEverything: CONFIG.CACHE.CACHE_EVERYTHING,
        cacheKey: target.toString(),
      };
    }

    const proxyRequest = new Request(target, requestInit);

    // 6. 发起请求
    console.log(`[Proxy] ${request.method} ${target.toString()}`);
    const response = await fetch(proxyRequest);

    // 7. 处理重定向
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      if (location) {
        const absoluteLocation = new URL(location, target).toString();
        const proxyLocation = `${url.origin}/${encodeURIComponent(absoluteLocation)}`;

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: {
            ...Object.fromEntries(response.headers),
            Location: proxyLocation,
            ...corsHeaders(),
            ...noCacheHeaders(),
          },
        });
      }
    }

    // 8. 处理 HTML 内容中的相对路径
    let body = response.body;
    const contentType = response.headers.get("Content-Type") || "";

    if (contentType.includes("text/html")) {
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
    if (contentType.includes("text/html")) {
      Object.entries(noCacheHeaders()).forEach(([key, value]) => {
        responseHeaders.set(key, value);
      });
    }

    return new Response(body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("[Proxy Error]", error);
    return errorResponse(error, 502);
  }
}

// ==================== 提取目标 URL ====================
function extractTargetUrl(request, url) {
  // 方式 1: 查询参数 ?url=https://example.com
  let targetUrl = url.searchParams.get("url");
  if (targetUrl) return targetUrl;

  // 方式 2: 路径方式 /https://example.com 或 /example.com
  if (url.pathname !== "/") {
    let path = decodeURIComponent(url.pathname.substring(1));

    // 如果路径已经包含协议
    if (path.startsWith("http://") || path.startsWith("https://")) {
      targetUrl = path;
    } else {
      // 自动添加 https 协议
      targetUrl = "https://" + path;
    }

    // 保留查询参数
    if (url.search) {
      targetUrl += url.search;
    }

    return targetUrl;
  }

  // 方式 3: 标准 HTTP 代理模式
  const host = request.headers.get("Host");
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
    `$1${proxyOrigin}/${origin}/$3`,
  );

  // 替换相对协议：href="//" src="//"
  modified = modified.replace(
    /((href|src|action)=["'])\/\//gi,
    `$1${proxyOrigin}/https://`,
  );

  return modified;
}

// ==================== 清理请求头 ====================
function cleanHeaders(headers) {
  const cleaned = new Headers(headers);

  // 移除不应转发的头
  CONFIG.SECURITY.REMOVE_HEADERS.forEach((header) => {
    cleaned.delete(header);
  });

  // 设置合理的 User-Agent
  if (!cleaned.has("User-Agent")) {
    cleaned.set(
      "User-Agent",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    );
  }

  return cleaned;
}

// ==================== 响应辅助函数 ====================
function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(),
      ...extraHeaders,
    },
  });
}

function errorResponse(error, status = 500) {
  console.error(`[Error ${status}]`, error);

  return jsonResponse(
    {
      error: error.message || "Internal server error",
      status: status,
      timestamp: new Date().toISOString(),
      version: CONFIG.VERSION,
    },
    status,
  );
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods":
      "GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Max-Age": "86400",
  };
}

function noCacheHeaders() {
  return {
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  };
}
