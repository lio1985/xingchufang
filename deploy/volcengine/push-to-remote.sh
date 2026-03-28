#!/bin/bash

# ===================================
# Git 推送脚本
# ===================================
# 使用方法：
# 1. 在代码托管平台创建空仓库（不要初始化 README）
# 2. 复制仓库地址
# 3. 修改下方 REMOTE_URL 变量
# 4. 执行脚本：bash deploy/volcengine/push-to-remote.sh
# ===================================

# 请修改为你的仓库地址
REMOTE_URL="https://code.volcengine.com/your-namespace/star-kitchen.git"
# 或使用 SSH 地址
# REMOTE_URL="git@code.volcengine.com:your-namespace/star-kitchen.git"

cd /workspace/projects

# 添加远程仓库
echo "添加远程仓库..."
git remote add origin $REMOTE_URL

# 推送所有分支
echo "推送代码到远程仓库..."
git push -u origin main

# 查看推送结果
echo ""
echo "================================"
echo "推送完成！"
echo "================================"
echo "仓库地址: $REMOTE_URL"
echo ""
echo "下一步：在服务器上执行以下命令"
echo "  git clone $REMOTE_URL /opt/star-kitchen"
echo "  cd /opt/star-kitchen"
echo "  cp server/.env.production.example server/.env"
echo "  vim server/.env  # 配置环境变量"
echo "  docker-compose up -d --build"
