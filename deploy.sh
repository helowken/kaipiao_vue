#!/bin/bash

# 开票申请系统 - 部署脚本
# 使用方法: ./deploy.sh [jetty-path]

set -e

echo "🚀 开始部署开票申请系统..."

# 检查参数
if [ $# -eq 0 ]; then
    echo "❌ 请提供 Jetty 应用路径"
    echo "使用方法: ./deploy.sh /path/to/jetty/webapps/your-app"
    exit 1
fi

JETTY_PATH=$1
INVOICE_PATH="$JETTY_PATH/invoice"

echo "📦 开始构建生产版本..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败！"
    exit 1
fi

echo "✅ 构建成功！"

# 检查目标路径
if [ ! -d "$JETTY_PATH" ]; then
    echo "❌ Jetty 路径不存在: $JETTY_PATH"
    exit 1
fi

# 创建 invoice 目录
echo "📁 创建部署目录..."
mkdir -p "$INVOICE_PATH"

# 备份现有文件
if [ -d "$INVOICE_PATH" ] && [ "$(ls -A $INVOICE_PATH)" ]; then
    BACKUP_DIR="$INVOICE_PATH.backup.$(date +%Y%m%d_%H%M%S)"
    echo "💾 备份现有文件到: $BACKUP_DIR"
    mv "$INVOICE_PATH" "$BACKUP_DIR"
    mkdir -p "$INVOICE_PATH"
fi

# 复制构建文件
echo "📋 复制文件到 Jetty..."
cp -r dist/* "$INVOICE_PATH/"

# 设置权限
echo "🔐 设置文件权限..."
chmod -R 644 "$INVOICE_PATH"/*
chmod 755 "$INVOICE_PATH"
find "$INVOICE_PATH" -type d -exec chmod 755 {} \;

# 验证部署
echo "🔍 验证部署..."
if [ -f "$INVOICE_PATH/index.html" ]; then
    echo "✅ 部署成功！"
    echo ""
    echo "📋 部署信息:"
    echo "   应用路径: $INVOICE_PATH"
    echo "   访问地址: http://your-domain/your-app/invoice/"
    echo "   静态文件: $(find $INVOICE_PATH -type f | wc -l) 个"
    echo "   总大小: $(du -sh $INVOICE_PATH | cut -f1)"
    echo ""
    echo "🎯 后续步骤:"
    echo "1. 重启 Jetty 服务器"
    echo "2. 配置后端 API 接口"
    echo "3. 测试应用功能"
    echo "4. 检查移动端兼容性"
else
    echo "❌ 部署失败！未找到 index.html"
    exit 1
fi

echo ""
echo "🎉 部署完成！"
