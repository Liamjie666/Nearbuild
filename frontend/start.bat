@echo off
echo ========================================
echo    NeraBuild 黑匣装机 - 开发服务器
echo ========================================
echo.

echo 正在检查 Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未找到 Node.js，请先安装 Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

echo 正在检查 npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未找到 npm，请检查 Node.js 安装
    pause
    exit /b 1
)

echo 正在安装依赖...
npm install

echo 正在安装 Tailwind CSS...
npm install -D tailwindcss postcss autoprefixer

echo 正在安装 3D 和动效依赖...
npm install @react-three/fiber @react-three/drei framer-motion

echo.
echo ========================================
echo    启动开发服务器...
echo    访问: http://localhost:3000
echo    按 Ctrl+C 停止服务器
echo ========================================
echo.

npm run dev 