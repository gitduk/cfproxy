// ui.js
export function getHTML(config) {
  return `<!DOCTYPE html>
<html lang="zh-CN" class="h-full scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cloudflare Proxy - 极速全球代理服务</title>
  <meta name="description" content="基于 Cloudflare Workers 的全功能 HTTP/HTTPS 代理服务，安全、快速、免费">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🚀</text></svg>">
  
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            primary: {
              50: '#f0fdfa',
              100: '#ccfbf1',
              200: '#99f6e4',
              300: '#5eead4',
              400: '#2dd4bf',
              500: '#14b8a6',
              600: '#0d9488',
              700: '#0f766e',
              800: '#115e59',
              900: '#134e4a',
            }
          },
          animation: {
            'gradient': 'gradient 8s linear infinite',
            'float': 'float 6s ease-in-out infinite',
            'glow': 'glow 2s ease-in-out infinite alternate',
            'slide-up': 'slideUp 0.5s ease-out',
            'fade-in': 'fadeIn 0.6s ease-out',
          },
          keyframes: {
            gradient: {
              '0%, 100%': {
                'background-size': '200% 200%',
                'background-position': 'left center'
              },
              '50%': {
                'background-size': '200% 200%',
                'background-position': 'right center'
              },
            },
            float: {
              '0%, 100%': { transform: 'translateY(0px)' },
              '50%': { transform: 'translateY(-20px)' },
            },
            glow: {
              'from': { 'box-shadow': '0 0 20px rgba(20, 184, 166, 0.5)' },
              'to': { 'box-shadow': '0 0 30px rgba(20, 184, 166, 0.8)' },
            },
            slideUp: {
              'from': { 
                opacity: '0',
                transform: 'translateY(30px)' 
              },
              'to': { 
                opacity: '1',
                transform: 'translateY(0)' 
              },
            },
            fadeIn: {
              'from': { opacity: '0' },
              'to': { opacity: '1' },
            },
          }
        }
      }
    }
  </script>
  
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    
    * {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    
    .gradient-bg {
      background: linear-gradient(-45deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%);
      background-size: 400% 400%;
      animation: gradient 15s ease infinite;
    }
    
    .glass-effect {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .dark .glass-effect {
      background: rgba(24, 24, 27, 0.8);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(63, 63, 70, 0.3);
    }
    
    .hover-lift {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .hover-lift:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    }
    
    .dark .hover-lift:hover {
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
    }
    
    .code-block {
      position: relative;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2px;
      border-radius: 0.75rem;
      transition: all 0.3s ease;
    }
    
    .code-block:hover {
      transform: scale(1.02);
      box-shadow: 0 8px 30px rgba(102, 126, 234, 0.4);
    }
    
    .code-inner {
      background: #1e1e1e;
      padding: 1rem;
      border-radius: 0.65rem;
      position: relative;
    }
    
    .dark .code-inner {
      background: #0a0a0a;
    }
    
    .copy-btn {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      padding: 6px 14px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      border-radius: 6px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .copy-btn:hover {
      transform: translateY(-50%) scale(1.05);
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.5);
    }
    
    .copy-btn.copied {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    }
    
    .feature-card {
      background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .dark .feature-card {
      background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .feature-card:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: 0 20px 50px rgba(102, 126, 234, 0.3);
      border-color: rgba(102, 126, 234, 0.5);
    }
    
    .stat-number {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-weight: 800;
    }
    
    @keyframes pulse-ring {
      0% {
        transform: scale(0.8);
        opacity: 1;
      }
      100% {
        transform: scale(1.2);
        opacity: 0;
      }
    }
    
    .pulse-ring {
      animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    
    input:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.3);
    }
    
    .gradient-text {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  </style>
</head>

<body class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-black dark:to-gray-900">
  
  <!-- 背景装饰 -->
  <div class="fixed inset-0 overflow-hidden pointer-events-none">
    <div class="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float"></div>
    <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style="animation-delay: 2s"></div>
    <div class="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style="animation-delay: 4s"></div>
  </div>

  <!-- 主容器 -->
  <div class="relative z-10">
    
    <!-- 导航栏 -->
    <nav class="glass-effect sticky top-0 z-50 animate-fade-in">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-3">
            <div class="text-3xl animate-float">🚀</div>
            <span class="text-xl font-bold gradient-text">Cloudflare Proxy</span>
          </div>
          <div class="flex items-center space-x-4">
            <a href="/health" class="text-sm text-gray-600 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition">
              健康检查
            </a>
            <a href="https://github.com" target="_blank" class="text-sm text-gray-600 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="pt-20 pb-16 px-4 sm:px-6 lg:px-8 animate-slide-up">
      <div class="max-w-7xl mx-auto text-center">
        <div class="relative inline-block mb-8">
          <div class="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-2xl opacity-50 pulse-ring"></div>
          <div class="relative text-7xl sm:text-8xl animate-float">🌐</div>
        </div>
        
        <h1 class="text-5xl sm:text-7xl font-extrabold mb-6 leading-tight">
          <span class="gradient-text">极速全球代理</span>
        </h1>
        
        <p class="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
          基于 <span class="font-semibold text-purple-600 dark:text-purple-400">Cloudflare Workers</span> 
          构建的下一代代理服务
          <br/>
          <span class="text-lg">安全 • 快速 • 免费 • 无限制</span>
        </p>

        <!-- 统计数据 -->
        <div class="flex justify-center space-x-8 mb-12">
          <div class="text-center">
            <div class="stat-number text-4xl font-bold mb-1">99.9%</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">可用性</div>
          </div>
          <div class="text-center">
            <div class="stat-number text-4xl font-bold mb-1">&lt;100ms</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">响应时间</div>
          </div>
          <div class="text-center">
            <div class="stat-number text-4xl font-bold mb-1">275+</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">全球节点</div>
          </div>
        </div>

        <!-- 输入表单 -->
        <div class="max-w-2xl mx-auto">
          <form id="urlForm" class="glass-effect rounded-2xl p-8 shadow-2xl hover-lift">
            <label class="block text-left text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
              🎯 输入目标网址
            </label>
            <div class="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                id="targetUrl"
                placeholder="example.com 或 https://example.com"
                required
                class="flex-1 px-6 py-4 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 transition-all duration-300 focus:border-purple-500 dark:focus:border-purple-400"
              >
              <button
                type="submit"
                class="px-8 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                🚀 开始代理
              </button>
            </div>
            <p class="mt-4 text-xs text-gray-500 dark:text-gray-400 text-left">
              💡 支持所有 HTTP/HTTPS 网站，自动处理跨域和重定向
            </p>
          </form>
        </div>
      </div>
    </section>

    <!-- 使用方式 -->
    <section class="py-20 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold gradient-text mb-4">🎯 多种使用方式</h2>
          <p class="text-gray-600 dark:text-gray-400 text-lg">选择最适合你的接入方式</p>
        </div>

        <div class="grid md:grid-cols-2 gap-6">
          <!-- 方式 1 -->
          <div class="glass-effect rounded-2xl p-8 hover-lift">
            <div class="flex items-center mb-4">
              <div class="text-3xl mr-3">🌐</div>
              <div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white">Web 界面</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">最简单的使用方式</p>
              </div>
            </div>
            <p class="text-gray-600 dark:text-gray-300 mb-4">
              直接在上方输入框输入目标网址，点击按钮即可访问
            </p>
            <div class="inline-flex items-center px-4 py-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium">
              <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              推荐新手使用
            </div>
          </div>

          <!-- 方式 2 -->
          <div class="glass-effect rounded-2xl p-8 hover-lift">
            <div class="flex items-center mb-4">
              <div class="text-3xl mr-3">🔗</div>
              <div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white">查询参数</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">URL 参数传递</p>
              </div>
            </div>
            <div class="code-block">
              <div class="code-inner">
                <code class="text-xs text-green-400 font-mono break-all" id="method2"></code>
                <button onclick="copyCode('method2')" class="copy-btn">复制</button>
              </div>
            </div>
          </div>

          <!-- 方式 3 -->
          <div class="glass-effect rounded-2xl p-8 hover-lift">
            <div class="flex items-center mb-4">
              <div class="text-3xl mr-3">📁</div>
              <div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white">路径方式</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">RESTful 风格</p>
              </div>
            </div>
            <div class="code-block">
              <div class="code-inner">
                <code class="text-xs text-green-400 font-mono break-all" id="method3"></code>
                <button onclick="copyCode('method3')" class="copy-btn">复制</button>
              </div>
            </div>
          </div>

          <!-- 方式 4 -->
          <div class="glass-effect rounded-2xl p-8 hover-lift">
            <div class="flex items-center mb-4">
              <div class="text-3xl mr-3">⚙️</div>
              <div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white">HTTP 代理</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">环境变量配置</p>
              </div>
            </div>
            <div class="code-block">
              <div class="code-inner">
                <code class="text-xs text-green-400 font-mono break-all" id="method4"></code>
                <button onclick="copyCode('method4')" class="copy-btn">复制</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 使用场景 -->
    <section class="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-gray-50 dark:to-gray-900/50">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold gradient-text mb-4">💡 应用场景</h2>
          <p class="text-gray-600 dark:text-gray-400 text-lg">解决各种网络访问难题</p>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- 场景 1 -->
          <div class="feature-card rounded-2xl p-6 text-center">
            <div class="text-5xl mb-4 animate-float">📦</div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">GitHub 加速</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
              加速 GitHub 文件下载和 Release 资源
            </p>
            <div class="code-block">
              <div class="code-inner">
                <code class="text-xs text-green-400 font-mono break-all" id="scene1"></code>
                <button onclick="copyCode('scene1')" class="copy-btn" style="font-size: 10px; padding: 4px 10px;">复制</button>
              </div>
            </div>
          </div>

          <!-- 场景 2 -->
          <div class="feature-card rounded-2xl p-6 text-center">
            <div class="text-5xl mb-4 animate-float" style="animation-delay: 1s">🐳</div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">Docker 镜像</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
              配置 Docker 镜像加速源
            </p>
            <div class="code-block">
              <div class="code-inner">
                <code class="text-xs text-green-400 font-mono break-all" id="scene2"></code>
                <button onclick="copyCode('scene2')" class="copy-btn" style="font-size: 10px; padding: 4px 10px;">复制</button>
              </div>
            </div>
          </div>

          <!-- 场景 3 -->
          <div class="feature-card rounded-2xl p-6 text-center">
            <div class="text-5xl mb-4 animate-float" style="animation-delay: 2s">🤖</div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">API 代理</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
              代理各类 API 请求
            </p>
            <div class="code-block">
              <div class="code-inner">
                <code class="text-xs text-green-400 font-mono break-all" id="scene3"></code>
                <button onclick="copyCode('scene3')" class="copy-btn" style="font-size: 10px; padding: 4px 10px;">复制</button>
              </div>
            </div>
          </div>

          <!-- 场景 4 -->
          <div class="feature-card rounded-2xl p-6 text-center">
            <div class="text-5xl mb-4 animate-float" style="animation-delay: 3s">🌍</div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">CORS 解决</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
              前端跨域问题一键解决
            </p>
            <div class="code-block">
              <div class="code-inner">
                <code class="text-xs text-green-400 font-mono break-all" id="scene4"></code>
                <button onclick="copyCode('scene4')" class="copy-btn" style="font-size: 10px; padding: 4px 10px;">复制</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 功能特性 -->
    <section class="py-20 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold gradient-text mb-4">✨ 核心特性</h2>
          <p class="text-gray-600 dark:text-gray-400 text-lg">企业级功能，完全免费</p>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="glass-effect rounded-xl p-6 text-center hover-lift">
            <div class="text-4xl mb-3">🔒</div>
            <h3 class="font-bold text-gray-900 dark:text-white mb-2">HTTPS 加密</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">全程 SSL/TLS 加密传输</p>
          </div>
          
          <div class="glass-effect rounded-xl p-6 text-center hover-lift">
            <div class="text-4xl mb-3">🌐</div>
            <h3 class="font-bold text-gray-900 dark:text-white mb-2">CORS 支持</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">完美解决跨域问题</p>
          </div>
          
          <div class="glass-effect rounded-xl p-6 text-center hover-lift">
            <div class="text-4xl mb-3">⚡</div>
            <h3 class="font-bold text-gray-900 dark:text-white mb-2">智能缓存</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">CDN 级别缓存加速</p>
          </div>
          
          <div class="glass-effect rounded-xl p-6 text-center hover-lift">
            <div class="text-4xl mb-3">🛡️</div>
            <h3 class="font-bold text-gray-900 dark:text-white mb-2">安全限流</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">防止滥用攻击</p>
          </div>

          <div class="glass-effect rounded-xl p-6 text-center hover-lift">
            <div class="text-4xl mb-3">🔄</div>
            <h3 class="font-bold text-gray-900 dark:text-white mb-2">智能重定向</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">自动处理 30x 跳转</p>
          </div>
          
          <div class="glass-effect rounded-xl p-6 text-center hover-lift">
            <div class="text-4xl mb-3">🌍</div>
            <h3 class="font-bold text-gray-900 dark:text-white mb-2">全球 CDN</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">275+ 个边缘节点</p>
          </div>
          
          <div class="glass-effect rounded-xl p-6 text-center hover-lift">
            <div class="text-4xl mb-3">📊</div>
            <h3 class="font-bold text-gray-900 dark:text-white mb-2">实时监控</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">健康检查接口</p>
          </div>
          
          <div class="glass-effect rounded-xl p-6 text-center hover-lift">
            <div class="text-4xl mb-3">🎨</div>
            <h3 class="font-bold text-gray-900 dark:text-white mb-2">美观界面</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">现代化设计风格</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 页脚 -->
    <footer class="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/50">
      <div class="max-w-7xl mx-auto">
        <div class="flex flex-col md:flex-row justify-between items-center gap-6">
          <div class="text-center md:text-left">
            <div class="flex items-center justify-center md:justify-start space-x-2 mb-2">
              <div class="text-2xl">🚀</div>
              <span class="text-lg font-bold gradient-text">Cloudflare Proxy</span>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Powered by Cloudflare Workers • Version ${config.VERSION}
            </p>
          </div>
          
          <div class="flex items-center space-x-6">
            <a href="/health" target="_blank" 
               class="text-sm text-gray-600 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors duration-300">
              健康检查
            </a>
            <a href="https://github.com" target="_blank" 
               class="flex items-center space-x-2 text-sm text-gray-600 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors duration-300">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
              <span>GitHub</span>
            </a>
          </div>
        </div>
        
        <div class="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p class="text-center text-xs text-gray-500 dark:text-gray-400">
            © 2024 Cloudflare Proxy. Made with ❤️ for developers worldwide.
          </p>
        </div>
      </div>
    </footer>
  </div>

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
        button.textContent = '✓ 已复制';
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

    // 添加滚动动画
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);

    document.querySelectorAll('.feature-card, .glass-effect').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'all 0.6s ease-out';
      observer.observe(el);
    });
  </script>
</body>
</html>`;
}
