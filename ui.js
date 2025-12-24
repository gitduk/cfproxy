// ui.js
export function getHTML(config) {
  return `<!DOCTYPE html>
<html lang="zh-CN" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cloudflare Proxy</title>
  <meta name="description" content="基于 Cloudflare Workers 的全功能代理服务">
  
  <script src="https://cdn.tailwindcss.com"></script>
  
  <script>
    tailwind.config = {
      darkMode: 'media', // 自动跟随系统
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', '-apple-system', 'system-ui', 'sans-serif'],
          },
          colors: {
            slate: {
              850: '#151e2e',
            }
          }
        }
      }
    }
  </script>

  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

  <style>
    /* 基础样式微调 */
    body {
      font-family: 'Inter', sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    
    /* 隐藏滚动条但保留功能 (可选) */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    ::-webkit-scrollbar-track {
      background: transparent;
    }
    ::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 4px;
    }
    .dark ::-webkit-scrollbar-thumb {
      background: #475569;
    }

    /* 复制按钮动画 */
    .copy-btn {
      transition: all 0.2s ease;
    }
    .copy-btn.copied {
      background-color: #10b981 !important; /* emerald-500 */
      border-color: #10b981 !important;
      color: white !important;
    }
  </style>
</head>

<body class="bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100 transition-colors duration-300 min-h-screen flex flex-col">

  <nav class="sticky top-0 z-50 w-full border-b border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center space-x-3 group cursor-default">
          <div class="p-1.5 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 transition-transform group-hover:scale-105">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <span class="text-lg font-bold tracking-tight">CF Proxy</span>
        </div>
        <div class="flex items-center space-x-6">
          <a href="/health" class="text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">状态</a>
          <a href="https://github.com" target="_blank" class="text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">GitHub</a>
        </div>
      </div>
    </div>
  </nav>

  <main class="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
    
    <section class="text-center max-w-3xl mx-auto mb-24">
      <div class="inline-flex items-center justify-center p-2 mb-8 rounded-full bg-slate-100 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700">
        <span class="px-3 text-xs font-semibold tracking-wide uppercase text-slate-500 dark:text-slate-400">Serverless Proxy</span>
      </div>
      
      <h1 class="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
        无界浏览，<br class="hidden sm:block" />触手可及
      </h1>
      
      <p class="text-lg sm:text-xl text-slate-500 dark:text-slate-400 mb-10 leading-relaxed">
        基于 Cloudflare Workers 构建的轻量级代理服务。<br class="hidden sm:inline"/>
        支持 HTTPS 加密、跨域资源请求与 Docker 镜像加速。
      </p>

      <div class="max-w-xl mx-auto relative group">
        <div class="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-20 group-hover:opacity-40 blur transition duration-500"></div>
        <form id="urlForm" class="relative flex items-center bg-white dark:bg-slate-800 rounded-full shadow-lg ring-1 ring-slate-900/5 dark:ring-white/10 p-2">
          <div class="pl-4 text-slate-400">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <input
            type="text"
            id="targetUrl"
            placeholder="输入目标网址 (e.g., github.com)"
            required
            class="flex-1 w-full bg-transparent border-none focus:ring-0 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 outline-none"
          >
          <button
            type="submit"
            class="px-6 py-3 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-sm hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
          >
            访问
          </button>
        </form>
      </div>
    </section>

    <section class="mb-24">
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-2xl font-bold tracking-tight">快速接入</h2>
        <span class="h-px flex-1 bg-slate-200 dark:bg-slate-800 ml-6"></span>
      </div>
      
      <div class="grid md:grid-cols-2 gap-6">
        <div class="group p-6 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div class="flex items-start space-x-4">
            <div class="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-slate-900 dark:text-white mb-1">Web 直接访问</h3>
              <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">最简单的使用方式，通过本页面输入框直接跳转。</p>
            </div>
          </div>
        </div>

        <div class="group p-6 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div class="flex items-start space-x-4">
            <div class="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-slate-900 dark:text-white mb-3">路径拼接</h3>
              <div class="relative group/code">
                <div class="absolute inset-0 bg-slate-100 dark:bg-slate-900 rounded-lg transform transition-transform group-hover/code:scale-[1.02]"></div>
                <div class="relative flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  <code class="text-xs font-mono text-slate-600 dark:text-slate-300 break-all truncate pr-16" id="method3">Loading...</code>
                  <button onclick="copyCode('method3')" class="copy-btn absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-medium rounded-md bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700">复制</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="group p-6 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div class="flex items-start space-x-4">
            <div class="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600 dark:text-emerald-400">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-slate-900 dark:text-white mb-3">环境变量 (CLI)</h3>
              <div class="relative group/code">
                 <div class="relative flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  <code class="text-xs font-mono text-slate-600 dark:text-slate-300 break-all truncate pr-16" id="method4">Loading...</code>
                  <button onclick="copyCode('method4')" class="copy-btn absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-medium rounded-md bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700">复制</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
         <div class="group p-6 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div class="flex items-start space-x-4">
            <div class="p-2 bg-sky-50 dark:bg-sky-900/20 rounded-lg text-sky-600 dark:text-sky-400">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-slate-900 dark:text-white mb-3">Docker 加速</h3>
              <div class="relative group/code">
                 <div class="relative flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  <code class="text-xs font-mono text-slate-600 dark:text-slate-300 break-all truncate pr-16" id="scene2">Loading...</code>
                  <button onclick="copyCode('scene2')" class="copy-btn absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-medium rounded-md bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700">复制</button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>

    <section class="mb-24">
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-2xl font-bold tracking-tight">典型场景</h2>
        <span class="h-px flex-1 bg-slate-200 dark:bg-slate-800 ml-6"></span>
      </div>
      
      <div class="grid sm:grid-cols-2 gap-4">
        
        <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col justify-center">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-semibold flex items-center">
              <svg class="w-4 h-4 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
              GitHub 文件加速
            </span>
            <button onclick="copyCode('scene1')" class="text-xs text-blue-600 dark:text-blue-400 hover:underline copy-btn p-1 rounded">复制</button>
          </div>
          <code class="text-[10px] sm:text-xs font-mono text-slate-500 truncate" id="scene1">Loading...</code>
        </div>

        <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col justify-center">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-semibold flex items-center">
              <svg class="w-4 h-4 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
              OpenAI API 代理
            </span>
            <button onclick="copyCode('scene3')" class="text-xs text-blue-600 dark:text-blue-400 hover:underline copy-btn p-1 rounded">复制</button>
          </div>
          <code class="text-[10px] sm:text-xs font-mono text-slate-500 truncate" id="scene3">Loading...</code>
        </div>

        <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col justify-center sm:col-span-2">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-semibold flex items-center">
               <svg class="w-4 h-4 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
              JS Fetch (CORS)
            </span>
            <button onclick="copyCode('scene4')" class="text-xs text-blue-600 dark:text-blue-400 hover:underline copy-btn p-1 rounded">复制</button>
          </div>
          <code class="text-[10px] sm:text-xs font-mono text-slate-500 truncate" id="scene4">Loading...</code>
        </div>
      </div>
    </section>

    <section>
       <div class="flex items-center justify-between mb-10">
        <h2 class="text-2xl font-bold tracking-tight">核心能力</h2>
        <span class="h-px flex-1 bg-slate-200 dark:bg-slate-800 ml-6"></span>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition-colors text-center group">
          <div class="w-10 h-10 mx-auto mb-3 rounded-full bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center text-slate-700 dark:text-slate-300 group-hover:scale-110 transition-transform">
             <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          </div>
          <h3 class="font-medium text-sm text-slate-900 dark:text-slate-200">HTTPS 加密</h3>
        </div>

        <div class="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition-colors text-center group">
          <div class="w-10 h-10 mx-auto mb-3 rounded-full bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center text-slate-700 dark:text-slate-300 group-hover:scale-110 transition-transform">
             <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          </div>
          <h3 class="font-medium text-sm text-slate-900 dark:text-slate-200">智能缓存</h3>
        </div>

        <div class="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition-colors text-center group">
          <div class="w-10 h-10 mx-auto mb-3 rounded-full bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center text-slate-700 dark:text-slate-300 group-hover:scale-110 transition-transform">
             <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <h3 class="font-medium text-sm text-slate-900 dark:text-slate-200">全球 CDN</h3>
        </div>

        <div class="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition-colors text-center group">
          <div class="w-10 h-10 mx-auto mb-3 rounded-full bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center text-slate-700 dark:text-slate-300 group-hover:scale-110 transition-transform">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
          </div>
          <h3 class="font-medium text-sm text-slate-900 dark:text-slate-200">安全限流</h3>
        </div>
      </div>
    </section>

  </main>

  <footer class="border-t border-slate-200/60 dark:border-slate-800/60 py-10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
      <div class="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
        <span class="font-semibold text-sm">Cloudflare Proxy</span>
        <span class="text-slate-300 dark:text-slate-600">|</span>
        <span class="text-xs">v${config.VERSION}</span>
      </div>
      
      <p class="text-xs text-slate-400 dark:text-slate-500 text-center md:text-right">
        Powered by Cloudflare Workers · Designed with Minimalist UI
      </p>
    </div>
  </footer>

  <script>
    const currentOrigin = window.location.origin;
    const isLocal = currentOrigin.includes('localhost') || currentOrigin.includes('127.0.0.1');
    const demoDomain = isLocal ? 'https://example.com' : 'https://raw.githubusercontent.com';

    // 填充内容
    document.getElementById('method3').textContent = currentOrigin + '/https://example.com';
    document.getElementById('method4').textContent = 'export HTTP_PROXY=' + currentOrigin;
    document.getElementById('scene1').textContent = currentOrigin + '/https://raw.githubusercontent.com/user/repo/main/file.txt';
    document.getElementById('scene2').textContent = currentOrigin + '/https://registry-1.docker.io';
    document.getElementById('scene3').textContent = currentOrigin + '/https://api.openai.com/v1/chat/completions';
    document.getElementById('scene4').textContent = 'fetch("' + currentOrigin + '/https://api.example.com/data")';

    // 复制功能优化
    window.copyCode = function(elementId) {
      const text = document.getElementById(elementId).textContent;
      const button = event.currentTarget; // 使用 currentTarget 确保获取到 button
      
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
      });
    }

    // 表单提交
    document.getElementById('urlForm').addEventListener('submit', function(event) {
      event.preventDefault();
      let targetUrl = document.getElementById('targetUrl').value.trim();
      if (!targetUrl) return;

      if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = 'https://' + targetUrl;
      }

      const proxyUrl = currentOrigin + '/' + targetUrl; // 直接拼接，Cloudflare通常能处理，或者 encodeURIComponent
      // 为了兼容性，建议 encodeURICompnent，但为了视觉美观，这里保持直接拼接逻辑，视后端实现而定
      // 如果后端支持 /https://google.com 这种格式：
      window.open(currentOrigin + '/' + targetUrl, '_blank');
    });
  </script>
</body>
</html>`;
}
