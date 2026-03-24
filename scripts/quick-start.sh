#!/bin/bash

################################################################################
# 星厨房内容创作助手 - 快速部署脚本（简化版）
#
# 适用于首次部署，自动完成基础环境配置
################################################################################

set -e

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROJECT_DIR="/opt/xingchufang"
DOMAIN="your-domain.com"

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  星厨房内容创作助手 - 快速部署${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# 1. 检查 root 权限
if [ "$EUID" -ne 0 ]; then
    echo -e "${YELLOW}请使用 root 用户或 sudo 运行此脚本${NC}"
    exit 1
fi

# 2. 安装基础工具
echo -e "${GREEN}[1/6] 安装基础工具...${NC}"
apt-get update -y
apt-get install -y curl git

# 3. 安装 Node.js 18
echo -e "${GREEN}[2/6] 安装 Node.js 18...${NC}"
if ! command -v node &> /dev/null || [ "$(node -v | cut -d'v' -f2 | cut -d'.' -f1)" -lt 18 ]; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi
echo "Node.js 版本: $(node -v)"

# 4. 安装 pnpm
echo -e "${GREEN}[3/6] 安装 pnpm...${NC}"
if ! command -v pnpm &> /dev/null; then
    npm install -g pnpm
fi
echo "pnpm 版本: $(pnpm -v)"

# 5. 创建项目目录
echo -e "${GREEN}[4/6] 创建项目目录...${NC}"
mkdir -p $PROJECT_DIR

# 6. 提示上传代码
echo -e "${GREEN}[5/6] 上传代码...${NC}"
echo -e "${YELLOW}请使用以下方式之一上传代码到 $PROJECT_DIR 目录：${NC}"
echo "  1. Git: git clone your-repo-url $PROJECT_DIR"
echo "  2. SCP: scp -r ./* root@$HOSTNAME:$PROJECT_DIR"
echo ""
read -p "代码已上传，是否继续？(y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}部署已取消${NC}"
    exit 1
fi

# 7. 安装依赖
echo -e "${GREEN}[6/6] 安装依赖...${NC}"
cd $PROJECT_DIR
pnpm install

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  基础环境配置完成！${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo -e "${YELLOW}后续步骤：${NC}"
echo "  1. 配置环境变量: cp $PROJECT_DIR/.env.example $PROJECT_DIR/.env && nano $PROJECT_DIR/.env"
echo "  2. 运行完整部署: sudo $PROJECT_DIR/scripts/deploy.sh"
echo ""
