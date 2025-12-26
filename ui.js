export function getHtml(config) {
  return `<!DOCTYPE html>
<html lang="zh-CN" class="h-full">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CFProxy - 全功能代理服务</title>
  <meta name="description" content="基于 Cloudflare Workers 的全功能 HTTP/HTTPS 代理服务">

  <!-- 性能优化：DNS 预连接 -->
  <link rel="preconnect" href="https://cdn.tailwindcss.com">
  <link rel="dns-prefetch" href="https://cdn.tailwindcss.com">

  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='0.9em' font-size='90'%3E🌐%3C/text%3E%3C/svg%3E">

  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            zinc: {
              50: '#fafafa',
              100: '#f4f4f5',
              200: '#e4e4e7',
              300: '#d4d4d8',
              400: '#a1a1aa',
              500: '#71717a',
              600: '#52525b',
              700: '#3f3f46',
              800: '#27272a',
              900: '#18181b',
            },
            teal: {
              400: '#2dd4bf',
              500: '#14b8a6',
              600: '#0d9488',
            }
          }
        }
      }
    }
  </script>

  <style>
    :root {
      --bg-primary: theme('colors.zinc.50');
      --bg-secondary: theme('colors.white');
      --text-primary: theme('colors.zinc.800');
      --text-secondary: theme('colors.zinc.600');
      --border-color: theme('colors.zinc.100');
      --accent-color: theme('colors.teal.500');
    }

    @media (prefers-color-scheme: dark) {
      :root {
        --bg-primary: theme('colors.black');
        --bg-secondary: theme('colors.zinc.900');
        --text-primary: theme('colors.zinc.100');
        --text-secondary: theme('colors.zinc.400');
        --border-color: rgba(63, 63, 70, 0.4);
        --accent-color: theme('colors.teal.400');
      }
    }

    body {
      background-color: var(--bg-primary);
      color: var(--text-primary);
    }

    /* 输入验证样式 */
    .input-valid {
      border-color: #10b981 !important;
      box-shadow: 0 0 0 1px #10b981 !important;
    }

    .validation-icon {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      pointer-events: none;
    }
  </style>
</head>
<body class="flex h-full flex-col">
  <div class="flex w-full flex-col">
    <!-- 主内容区域 -->
    <div class="relative flex w-full flex-col bg-white ring-1 ring-zinc-100 dark:bg-zinc-900 dark:ring-zinc-300/20">
      <main class="flex-auto">
        <div class="sm:px-8 mt-16 sm:mt-32">
          <div class="mx-auto w-full max-w-7xl lg:px-8">
            <div class="relative px-4 sm:px-8 lg:px-12">
              <div class="mx-auto max-w-2xl lg:max-w-5xl">

                <!-- 标题区域 -->
                <div class="max-w-2xl">
                  <h1 class="text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl dark:text-zinc-100">
                    CFProxy
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
                      <div class="relative">
                        <input
                          type="text"
                          id="targetUrl"
                          placeholder="example.com 或 https://example.com"
                          required
                          class="w-full rounded-md bg-white px-4 py-2 pr-10 text-sm text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-zinc-700 dark:placeholder:text-zinc-500 transition-all"
                        >
                        <!-- 验证图标 -->
                        <span id="validationIcon" class="validation-icon hidden">
                          <!-- 成功图标 -->
                          <svg id="validIcon" class="w-5 h-5 text-green-500 hidden" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                          </svg>
                          <!-- 错误图标 -->
                          <svg id="invalidIcon" class="w-5 h-5 text-yellow-500 hidden" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                          </svg>
                        </span>
                      </div>
                      <!-- 验证提示信息 -->
                      <p id="validationMessage" class="mt-2 text-xs hidden">
                        <span id="errorMessage" class="text-yellow-600 dark:text-yellow-400"></span>
                        <span id="successMessage" class="text-green-600 dark:text-green-400"></span>
                      </p>
                    </div>
                    <button
                      type="submit"
                      id="submitButton"
                      class="w-full rounded-md bg-zinc-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:bg-teal-500 dark:hover:bg-teal-400 disabled:cursor-not-allowed transition-all"
                    >
                      开始代理
                    </button>
                  </form>
                </div>

                <!-- 使用方式 -->
                <div class="mt-16 rounded-2xl border border-zinc-100 p-6 dark:border-zinc-700/40">
                  <h2 class="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                    使用方式
                  </h2>
                  <div class="space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
                    <div class="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/50">
                      <div class="font-medium text-zinc-900 dark:text-zinc-100 mb-2">方式 1: Web 界面</div>
                      <p>在上方输入框输入目标网址即可</p>
                    </div>
                    <div class="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/50">
                      <div class="font-medium text-zinc-900 dark:text-zinc-100 mb-2">方式 2: 查询参数</div>
                      <code class="text-xs text-teal-600 dark:text-teal-400 break-all" id="method2"></code>
                    </div>
                    <div class="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/50">
                      <div class="font-medium text-zinc-900 dark:text-zinc-100 mb-2">方式 3: 路径方式</div>
                      <code class="text-xs text-teal-600 dark:text-teal-400 break-all" id="method3"></code>
                    </div>
                    <div class="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/50">
                      <div class="font-medium text-zinc-900 dark:text-zinc-100 mb-2">方式 4: HTTP 代理</div>
                      <code class="text-xs text-teal-600 dark:text-teal-400 break-all" id="method4"></code>
                    </div>
                  </div>
                </div>

                <!-- 使用场景 -->
                <div class="mt-16 rounded-2xl border border-zinc-100 p-6 dark:border-zinc-700/40">
                  <h2 class="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                    使用场景
                  </h2>
                  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div class="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/50">
                      <div class="font-medium text-zinc-900 dark:text-zinc-100 mb-2">GitHub 文件加速</div>
                      <p class="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                        加速 raw.githubusercontent.com 文件下载
                      </p>
                      <code class="text-xs text-teal-600 dark:text-teal-400 break-all" id="scene1"></code>
                    </div>
                    <div class="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/50">
                      <div class="font-medium text-zinc-900 dark:text-zinc-100 mb-2">Docker 镜像加速</div>
                      <p class="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                        配置 Docker 镜像代理源
                      </p>
                      <code class="text-xs text-teal-600 dark:text-teal-400 break-all" id="scene2"></code>
                    </div>
                    <div class="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/50">
                      <div class="font-medium text-zinc-900 dark:text-zinc-100 mb-2">OpenAI API 代理</div>
                      <p class="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                        代理 OpenAI API 请求
                      </p>
                      <code class="text-xs text-teal-600 dark:text-teal-400 break-all" id="scene3"></code>
                    </div>
                    <div class="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/50">
                      <div class="font-medium text-zinc-900 dark:text-zinc-100 mb-2">通用 CORS 代理</div>
                      <p class="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                        解决前端跨域问题
                      </p>
                      <code class="text-xs text-teal-600 dark:text-teal-400 break-all" id="scene4"></code>
                    </div>
                  </div>
                </div>

                <!-- 功能特性 -->
                <div class="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div class="flex items-center text-sm text-zinc-600 dark:text-zinc-400">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mr-2 text-teal-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    HTTPS 支持
                  </div>
                  <div class="flex items-center text-sm text-zinc-600 dark:text-zinc-400">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mr-2 text-teal-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    CORS 跨域
                  </div>
                  <div class="flex items-center text-sm text-zinc-600 dark:text-zinc-400">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mr-2 text-teal-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    智能重定向
                  </div>
                  <div class="flex items-center text-sm text-zinc-600 dark:text-zinc-400">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mr-2 text-teal-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    路径修复
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
                      Powered by Cloudflare Workers · v${config.VERSION}
                    </p>
                    <a
                      href="https://github.com/Yrobot/cloudflare-proxy"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="group flex items-center text-sm font-medium text-zinc-800 transition hover:text-teal-500 dark:text-zinc-200 dark:hover:text-teal-400"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mr-2 fill-zinc-500 transition group-hover:fill-teal-500 dark:fill-zinc-400 dark:group-hover:fill-teal-400" viewBox="0 0 24 24" aria-hidden="true">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.475 2 2 6.588 2 12.253c0 4.537 2.862 8.369 6.838 9.727.5.09.687-.218.687-.487 0-.243-.013-1.05-.013-1.91C7 20.059 6.35 18.957 6.15 18.38c-.113-.295-.6-1.205-1.025-1.448-.35-.192-.85-.667-.013-.68.788-.012 1.35.744 1.538 1.051.9 1.551 2.338 1.116 2.912.846.088-.666.35-1.115.638-1.371-2.225-.256-4.55-1.14-4.55-5.062 0-1.115.387-2.038 1.025-2.756-.1-.256-.45-1.307.1-2.717 0 0 .837-.269 2.75 1.051.8-.23 1.65-.346 2.5-.346.85 0 1.7.115 2.5.346 1.912-1.333 2.75-1.05 2.75-1.05.55 1.409.2 2.46.1 2.716.637.718 1.025 1.628 1.025 2.756 0 3.934-2.337 4.806-4.562 5.062.362.32.675.936.675 1.897 0 1.371-.013 2.473-.013 2.82 0 .268.188.589.688.486a10.039 10.039 0 0 0 4.932-3.74A10.447 10.447 0 0 0 22 12.253C22 6.588 17.525 2 12 2Z"/>
                      </svg>
                      在 GitHub 上给我们点赞
                    </a>
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
    // 获取当前域名并填充示例
    const currentOrigin = window.location.origin;

    // 填充使用方式示例
    document.getElementById('method2').textContent = currentOrigin + '/?url=https://example.com';
    document.getElementById('method3').textContent = currentOrigin + '/https://example.com';
    document.getElementById('method4').textContent = 'export HTTP_PROXY=' + currentOrigin;

    // 填充使用场景示例
    document.getElementById('scene1').textContent = currentOrigin + '/https://raw.githubusercontent.com/user/repo/main/file.txt';
    document.getElementById('scene2').textContent = currentOrigin + '/https://registry-1.docker.io';
    document.getElementById('scene3').textContent = currentOrigin + '/https://api.openai.com/v1/chat/completions';
    document.getElementById('scene4').textContent = 'fetch("' + currentOrigin + '/https://api.example.com/data")';

    // URL 验证功能
    const urlInput = document.getElementById('targetUrl');
    const submitButton = document.getElementById('submitButton');
    const validationIcon = document.getElementById('validationIcon');
    const validIcon = document.getElementById('validIcon');
    const invalidIcon = document.getElementById('invalidIcon');
    const validationMessage = document.getElementById('validationMessage');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');

    // URL 验证函数
    function validateUrl(input) {
      const value = input.trim();

      // 空值不验证
      if (!value) {
        return { valid: null, message: '' };
      }

      // 添加协议（如果没有）
      let testUrl = value;
      if (!testUrl.startsWith('http://') && !testUrl.startsWith('https://')) {
        testUrl = 'https://' + testUrl;
      }

      // 验证 URL 格式
      try {
        const url = new URL(testUrl);

        // 检查主机名是否有效
        if (!url.hostname || url.hostname === 'localhost' || url.hostname.startsWith('127.')) {
          return { valid: false, message: '不支持本地地址' };
        }

        // 检查是否包含域名
        if (!url.hostname.includes('.') && url.hostname !== 'localhost') {
          return { valid: false, message: '请输入有效的域名' };
        }

        // 检查协议
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
          return { valid: false, message: '仅支持 HTTP/HTTPS 协议' };
        }

        return { valid: true, message: '网址格式正确' };
      } catch (e) {
        return { valid: false, message: '请输入有效的网址' };
      }
    }

    // 显示验证结果
    function showValidation(result) {
      if (result.valid === null) {
        // 重置状态
        urlInput.classList.remove('input-valid', 'input-invalid');
        validationIcon.classList.add('hidden');
        validationMessage.classList.add('hidden');
        submitButton.disabled = false;
        return;
      }

      validationIcon.classList.remove('hidden');
      validationMessage.classList.remove('hidden');

      if (result.valid) {
        // 显示成功状态
        urlInput.classList.remove('input-invalid');
        urlInput.classList.add('input-valid');
        validIcon.classList.remove('hidden');
        invalidIcon.classList.add('hidden');
        errorMessage.textContent = '';
        successMessage.textContent = result.message;
        errorMessage.classList.add('hidden');
        successMessage.classList.remove('hidden');
        submitButton.disabled = false;
      } else {
        // 显示错误状态
        urlInput.classList.remove('input-valid');
        urlInput.classList.add('input-invalid');
        validIcon.classList.add('hidden');
        invalidIcon.classList.remove('hidden');
        errorMessage.textContent = result.message;
        successMessage.textContent = '';
        errorMessage.classList.remove('hidden');
        successMessage.classList.add('hidden');
        submitButton.disabled = true;
      }
    }

    // 实时验证（输入时）
    let validationTimeout;
    urlInput.addEventListener('input', function() {
      clearTimeout(validationTimeout);
      validationTimeout = setTimeout(() => {
        const result = validateUrl(this.value);
        showValidation(result);
      }, 500); // 500ms 防抖
    });

    // 失去焦点时立即验证
    urlInput.addEventListener('blur', function() {
      clearTimeout(validationTimeout);
      const result = validateUrl(this.value);
      showValidation(result);
    });

    // 表单提交处理
    document.getElementById('urlForm').addEventListener('submit', function(event) {
      event.preventDefault();

      let targetUrl = urlInput.value.trim();

      // 最终验证
      const result = validateUrl(targetUrl);
      if (!result.valid) {
        showValidation(result);
        return;
      }

      // 如果没有协议,自动添加 https://
      if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = 'https://' + targetUrl;
      }

      // 构建代理 URL
      const proxyUrl = currentOrigin + '/' + encodeURIComponent(targetUrl);

      // 在新标签页打开
      window.open(proxyUrl, '_blank');
    });
  </script>
</body>
</html>`;
}
