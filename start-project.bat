@echo off
echo ========================================
echo NeraBuild 项目启动脚本
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

REM 启动后端服务
echo.
echo 🚀 启动后端服务...
cd backend
start "NeraBuild Backend" cmd /k "start.bat"
cd ..

REM 等待后端启动
echo.
echo ⏳ 等待后端服务启动...
timeout /t 10 /nobreak >nul

REM 启动前端服务
echo.
echo 🚀 启动前端服务...
cd frontend
start "NeraBuild Frontend" cmd /k "npm run dev"
cd ..

echo.
echo ✅ 项目启动完成！
echo.
echo 📊 前端地址: http://localhost:3000
echo 🔧 后端地址: http://localhost:3001
echo 🏥 健康检查: http://localhost:3001/health
echo.
echo 按任意键退出...
pause >nul 