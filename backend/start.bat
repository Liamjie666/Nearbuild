@echo off
echo ========================================
echo NeraBuild 后端服务启动脚本
echo ========================================

REM 检查 Node.js 是否安装
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到 Node.js，请先安装 Node.js
    pause
    exit /b 1
)

echo ✅ Node.js 已安装

REM 检查 Python 是否安装
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到 Python，请先安装 Python 3.8+
    pause
    exit /b 1
)

echo ✅ Python 已安装

REM 安装 Node.js 依赖
echo.
echo 📦 安装 Node.js 依赖...
npm install
if %errorlevel% neq 0 (
    echo ❌ 安装 Node.js 依赖失败
    pause
    exit /b 1
)

echo ✅ Node.js 依赖安装完成

REM 安装 Python 依赖
echo.
echo 📦 安装 Python 依赖...
cd scripts\crawler
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ❌ 安装 Python 依赖失败
    pause
    exit /b 1
)

cd ..\..

echo ✅ Python 依赖安装完成

REM 创建环境配置文件
if not exist .env (
    echo.
    echo 📝 创建环境配置文件...
    copy env.example .env
    echo ✅ 环境配置文件已创建，请编辑 .env 文件配置数据库等信息
)

REM 启动开发服务器
echo.
echo 🚀 启动开发服务器...
echo 📊 API 地址: http://localhost:3001
echo 🏥 健康检查: http://localhost:3001/health
echo.
echo 按 Ctrl+C 停止服务器
echo.

npm run dev 