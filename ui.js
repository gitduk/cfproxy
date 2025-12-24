// ui.js
export function getHTML(config) {
  return `<!DOCTYPE html>
<html lang="zh-CN" class="h-full">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cloudflare Proxy</title>
  <meta name="description" content="基于 Cloudflare Workers 的全功能代理服务">
  
  <script src="https://cdn.tailwindcss.com"></script>
  
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    * {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    
    body {
      background: #ffffff;
      color: #0a0a0a;
    }
    
    .dark body {
      background: #0a0a0a;
      color: #fafafa;
    }
    
    .card {
      background: #ffffff;
      border: 1px solid #e5e5e5;
      transition: all 0.3s ease;
    }
    
    .dark .card {
      background: #1a1a1a;
      border-color: #2a2a2a;
    }
    
    .card:hover {
      border-color: #0a0a0a;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .dark .card:hover {
      border-color: #fafafa;
      box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
    }
    
    .code-block {
      background: #f5f5f5;
      border: 1px solid #e5e5e5;
      border-radius: 0.5rem;
      position: relative;
      padding: 1rem;
      transition: all 0.3s ease;
    }
    
    .dark .code-block {
      background: #1a1a1a;
      border-color: #2a2a2a;
    }
    
    .code-block:hover {
      border-color: #0a0a0a;
    }
    
    .dark .code-block:hover {
      border-color: #fafafa;
    }
    
    .copy-btn {
      position: absolute;
      right: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      padding: 0.375rem 0.875rem;
      font-size: 0.75rem;
      font-weight: 500;
      cursor: pointer;
      border-radius: 0.375rem;
      background: #0a0a0a;
      color: #ffffff;
      border: 1px solid #0a0a0a;
      transition: all 0.2s ease;
    }
    
    .dark .copy-btn {
      background: #fafafa;
      color: #0a0a0a;
      border-color: #fafafa;
    }
    
    .copy-btn:hover {
      background: #ffffff;
      color: #0a0a0a;
    }
    
    .dark .copy-btn:hover {
      background: #0a0a0a;
      color: #fafafa;
    }
    
    .copy-btn.copied {
      background: #0a0a0a;
      color: #ffffff;
    }
    
    .dark .copy-btn.copied {
      background: #fafafa;
      color: #0a0a0a;
    }
    
    .btn-primary {
      background: #0a0a0a;
      color: #ffffff;
      border: 2px solid #0a0a0a;
      transition: all 0.3s ease;
    }
    
    .dark .btn-primary {
      background: #fafafa;
      color: #0a0a0a;
      border-color: #fafafa;
    }
    
    .btn-primary:hover {
      background: #ffffff;
      color: #0a0a0a;
    }
    
    .dark .btn-primary:hover {
      background: #0a0a0a;
      color: #fafafa;
    }
    
    input:focus {
      outline: none;
      border-color: #0a0a0a;
    }
    
    .dark input:focus {
      border-color: #fafafa;
    }
    
    .divider {
      border-color: #e5e5e5;
    }
    
    .dark .divider {
      border-color: #2a2a2a;
    }
    
    .icon {
      width: 1.5rem;
      height: 1.5rem;
    }
    
    .icon-lg {
      width: 2rem;
      height: 2rem;
    }
  </style>
</head>

<body>
  <!-- 导航栏 -->
  <nav class="border-b divider sticky top-0 bg-white dark:bg-black z-50">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center space-x-3">
          <svg class="icon-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
          <span class="text-lg font-semibold">Cloudflare Proxy</span>
        </div>
        <div class="flex items-center space-x-6">
          <a href="/health" class="text-sm hover:underline">健康检查</a>
          <a href="https://github.com" target="_blank" class="text-sm hover:underline">GitHub</a>
        </div>
      </div>
    </div>
  </nav>

  <!-- 主内容 -->
  <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    
    <!-- Hero -->
    <section class="text-center mb-20">
      <svg class="icon-lg mx-auto mb-6" style="width: 4rem; height: 4rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"/>
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
      
      <h1 class="text-5xl font-bold mb-4">Cloudflare Proxy</h1>
      <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-12">
        基于 Cloudflare Workers 的全功能 HTTP/HTTPS 代理服务<br/>
        安全 · 快速 · 免费
      </p>

      <!-- 输入框 -->
      <div class="max-w-2xl mx-auto">
        <form id="urlForm" class="card rounded-lg p-6">
          <label class="block text-left text-sm font-medium mb-3">
            输入目标网址
          </label>
          <div class="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              id="targetUrl"
              placeholder="example.com 或 https://example.com"
              required
              class="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-black transition-colors"
            >
            <button
              type="submit"
              class="px-8 py-3 rounded-lg font-medium btn-primary"
            >
              开始
            </button>
          </div>
        </form>
      </div>
    </section>

    <!-- 使用方式 -->
    <section class="mb-20">
      <h2 class="text-2xl font-bold text-center mb-12">使用方式</h2>
      
      <div class="grid md:grid-cols-2 gap-6">
        <!-- 方式 1 -->
        <div class="card rounded-lg p-6">
          <div class="flex items-start mb-4">
            <svg class="icon-lg mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
            </svg>
            <div>
              <h3 class="font-semibold mb-1">Web 界面</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">在上方输入框输入网址即可</p>
            </div>
          </div>
        </div>

        <!-- 方式 2 -->
        <div class="card rounded-lg p-6">
          <div class="flex items-start mb-4">
            <svg class="icon-lg mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
            </svg>
            <div class="flex-1">
              <h3 class="font-semibold mb-3">查询参数</h3>
              <div class="code-block">
                <code class="text-xs font-mono break-all pr-20" id="method2"></code>
                <button onclick="copyCode('method2')" class="copy-btn">复制</button>
              </div>
            </div>
          </div>
        </div>

        <!-- 方式 3 -->
        <div class="card rounded-lg p-6">
          <div class="flex items-start mb-4">
            <svg class="icon-lg mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
            </svg>
            <div class="flex-1">
              <h3 class="font-semibold mb-3">路径方式</h3>
              <div class="code-block">
                <code class="text-xs font-mono break-all pr-20" id="method3"></code>
                <button onclick="copyCode('method3')" class="copy-btn">复制</button>
              </div>
            </div>
          </div>
        </div>

        <!-- 方式 4 -->
        <div class="card rounded-lg p-6">
          <div class="flex items-start mb-4">
            <svg class="icon-lg mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <div class="flex-1">
              <h3 class="font-semibold mb-3">环境变量</h3>
              <div class="code-block">
                <code class="text-xs font-mono break-all pr-20" id="method4"></code>
                <button onclick="copyCode('method4')" class="copy-btn">复制</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 使用场景 -->
    <section class="mb-20">
      <h2 class="text-2xl font-bold text-center mb-12">应用场景</h2>
      
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="card rounded-lg p-5">
          <h3 class="font-semibold mb-2 flex items-center">
            <svg class="icon mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
            GitHub 加速
          </h3>
          <div class="code-block">
            <code class="text-xs font-mono break-all pr-16" id="scene1"></code>
            <button onclick="copyCode('scene1')" class="copy-btn" style="padding: 0.25rem 0.625rem; font-size: 0.625rem;">复制</button>
          </div>
        </div>

        <div class="card rounded-lg p-5">
          <h3 class="font-semibold mb-2 flex items-center">
            <svg class="icon mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
            </svg>
            Docker 镜像
          </h3>
          <div class="code-block">
            <code class="text-xs font-mono break-all pr-16" id="scene2"></code>
            <button onclick="copyCode('scene2')" class="copy-btn" style="padding: 0.25rem 0.625rem; font-size: 0.625rem;">复制</button>
          </div>
        </div>

        <div class="card rounded-lg p-5">
          <h3 class="font-semibold mb-2 flex items-center">
            <svg class="icon mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
            API 代理
          </h3>
          <div class="code-block">
            <code class="text-xs font-mono break-all pr-16" id="scene3"></code>
            <button onclick="copyCode('scene3')" class="copy-btn" style="padding: 0.25rem 0.625rem; font-size: 0.625rem;">复制</button>
          </div>
        </div>

        <div class="card rounded-lg p-5">
          <h3 class="font-semibold mb-2 flex items-center">
            <svg class="icon mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
            </svg>
            CORS 解决
          </h3>
          <div class="code-block">
            <code class="text-xs font-mono break-all pr-16" id="scene4"></code>
            <button onclick="copyCode('scene4')" class="copy-btn" style="padding: 0.25rem 0.625rem; font-size: 0.625rem;">复制</button>
          </div>
        </div>
      </div>
    </section>

    <!-- 功能特性 -->
    <section class="mb-20">
      <h2 class="text-2xl font-bold text-center mb-12">核心特性</h2>
      
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="card rounded-lg p-5 text-center">
          <svg class="icon-lg mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
          </svg>
          <h3 class="font-semibold mb-1">HTTPS 加密</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">端到端加密传输</p>
        </div>

        <div class="card rounded-lg p-5 text-center">
          <svg class="icon-lg mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
          </svg>
          <h3 class="font-semibold mb-1">CORS 支持</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">完美解决跨域</p>
        </div>

        <div class="card rounded-lg p-5 text-center">
          <svg class="icon-lg mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
          <h3 class="font-semibold mb-1">智能缓存</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">CDN 级别加速</p>
        </div>

        <div class="card rounded-lg p-5 text-center">
          <svg class="icon-lg mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
          </svg>
          <h3 class="font-semibold mb-1">安全限流</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">防止滥用攻击</p>
        </div>

        <div class="card rounded-lg p-5 text-center">
          <svg class="icon-lg mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          <h3 class="font-semibold mb-1">智能重定向</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">自动处理跳转</p>
        </div>

        <div class="card rounded-lg p-5 text-center">
          <svg class="icon-lg mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <h3 class="font-semibold mb-1">全球 CDN</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">275+ 边缘节点</p>
        </div>

        <div class="card rounded-lg p-5 text-center">
          <svg class="icon-lg mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
          <h3 class="font-semibold mb-1">实时监控</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">健康检查接口</p>
        </div>

        <div class="card rounded-lg p-5 text-center">
          <svg class="icon-lg mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/>
          </svg>
          <h3 class="font-semibold mb-1">简洁设计</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">极简黑白风格</p>
        </div>
      </div>
    </section>

  </main>

  <!-- 页脚 -->
  <footer class="border-t divider py-12">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col md:flex-row justify-between items-center gap-6">
        <div class="text-center md:text-left">
          <div class="flex items-center justify-center md:justify-start space-x-2 mb-2">
            <svg class="icon-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            <span class="font-semibold">Cloudflare Proxy</span>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Version ${config.VERSION}
          </p>
        </div>
        
        <div class="flex items-center space-x-6 text-sm">
          <a href="/health" class="hover:underline">健康检查</a>
          <a href="https://github.com" target="_blank" class="hover:underline flex items-center space-x-1">
            <svg class="icon" fill="currentColor" viewBox="0 0 24 24">
              <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" clip-rule="evenodd"/>
            </svg>
            <span>GitHub</span>
          </a>
        </div>
      </div>
      
      <div class="mt-8 pt-8 border-t divider text-center">
        <p class="text-xs text-gray-600 dark:text-gray-400">
          © 2024 Cloudflare Proxy. Powered by Cloudflare Workers.
        </p>
      </div>
    </div>
  </footer>

  <script>
    const currentOrigin = window.location.origin;

    // 填充示例代码
    document.getElementById('method2').textContent = currentOrigin + '/?url=https://example.com';
    document.getElementById('method3').textContent = currentOrigin + '/https://example.com';
    document.getElementById('method4').textContent = 'export HTTP_PROXY=' + currentOrigin;
    document.getElementById('scene1').textContent = currentOrigin + '/https://raw.githubusercontent.com/user/repo/main/file.txt';
    document.getElementById('scene2').textContent = currentOrigin + '/https://registry-1.docker.io';
    document.getElementById('scene3').textContent = currentOrigin + '/https://api.openai.com/v1/chat/completions';
    document.getElementById('scene4').textContent = 'fetch("' + currentOrigin + '/https://api.example.com/data")';

    // 复制功能
    window.copyCode = function(elementId) {
      const text = document.getElementById(elementId).textContent;
      const button = event.target;
      
      navigator.clipboard.writeText(text).then(() => {
        const originalText = button.textContent;
        button.textContent = '已复制';
        button.classList.add('copied');
        
        setTimeout(() => {
          button.textContent = originalText;
          button.classList.remove('copied');
        }, 2000);
      }).catch(err => {
        console.error('复制失败:', err);
        alert('复制失败，请手动复制');
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
