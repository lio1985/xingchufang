#!/bin/bash

# ===================================
# 星厨房部署脚本
# 适用于 2核2G 服务器
# ===================================

set -e

echo "=========================================="
echo "星厨房小程序部署脚本"
echo "=========================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 步骤 1: 构建前端
echo -e "${YELLOW}[1/4] 构建前端...${NC}"
pnpm build:weapp
pnpm build:web

# 步骤 2: 打包部署文件
echo -e "${YELLOW}[2/4] 打包部署文件...${NC}"
tar -czvf deploy.tar.gz \
    Dockerfile \
    docker-compose.yml \
    package.json \
    pnpm-lock.yaml \
    pnpm-workspace.yaml \
    tsconfig.json \
    server \
    nginx \
    dist-web

echo -e "${GREEN}✓ 打包完成: deploy.tar.gz${NC}"

# 步骤 3: 上传到服务器（需要配置 SSH）
echo -e "${YELLOW}[3/4] 上传到服务器...${NC}"
echo "请手动执行以下命令上传文件："
echo ""
echo "  scp deploy.tar.gz root@your-server-ip:/root/"
echo ""

# 步骤 4: 服务器部署说明
echo -e "${YELLOW}[4/4] 服务器部署命令：${NC}"
echo ""
echo "  # 解压文件"
echo "  cd /root && tar -xzvf deploy.tar.gz"
echo ""
echo "  # 构建并启动服务"
echo "  docker compose up -d --build"
echo ""
echo "  # 查看服务状态"
echo "  docker compose ps"
echo ""
echo -e "${GREEN}=========================================="
echo "部署完成！"
echo "==========================================${NC}"
