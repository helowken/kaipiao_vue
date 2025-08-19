@echo off
REM 开票申请系统 - Windows 部署脚本
REM 使用方法: deploy.bat "C:\path\to\jetty\webapps\your-app"

setlocal enabledelayedexpansion

echo 🚀 开始部署开票申请系统...

REM 检查参数
if "%~1"=="" (
    echo ❌ 请提供 Jetty 应用路径
    echo 使用方法: deploy.bat "C:\path\to\jetty\webapps\your-app"
    exit /b 1
)

set "JETTY_PATH=%~1"
set "INVOICE_PATH=%JETTY_PATH%\invoice"

echo 📦 开始构建生产版本...
call npm run build

if !errorlevel! neq 0 (
    echo ❌ 构建失败！
    exit /b 1
)

echo ✅ 构建成功！

REM 检查目标路径
if not exist "%JETTY_PATH%" (
    echo ❌ Jetty 路径不存在: %JETTY_PATH%
    exit /b 1
)

REM 创建 invoice 目录
echo 📁 创建部署目录...
if not exist "%INVOICE_PATH%" mkdir "%INVOICE_PATH%"

REM 备份现有文件
if exist "%INVOICE_PATH%\*" (
    set "BACKUP_DIR=%INVOICE_PATH%.backup.%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
    set "BACKUP_DIR=!BACKUP_DIR: =0!"
    echo 💾 备份现有文件到: !BACKUP_DIR!
    move "%INVOICE_PATH%" "!BACKUP_DIR!"
    mkdir "%INVOICE_PATH%"
)

REM 复制构建文件
echo 📋 复制文件到 Jetty...
xcopy /E /I /Y "dist\*" "%INVOICE_PATH%\"

REM 验证部署
echo 🔍 验证部署...
if exist "%INVOICE_PATH%\index.html" (
    echo ✅ 部署成功！
    echo.
    echo 📋 部署信息:
    echo    应用路径: %INVOICE_PATH%
    echo    访问地址: http://your-domain/your-app/invoice/
    echo.
    echo 🎯 后续步骤:
    echo 1. 重启 Jetty 服务器
    echo 2. 配置后端 API 接口
    echo 3. 测试应用功能
    echo 4. 检查移动端兼容性
) else (
    echo ❌ 部署失败！未找到 index.html
    exit /b 1
)

echo.
echo 🎉 部署完成！
pause
