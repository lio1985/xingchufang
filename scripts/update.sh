#!/bin/bash

################################################################################
# 星厨房内容创作助手 - 更新部署脚本
#
# 用于更新现有部署，重新拉取代码、安装依赖、构建和重启服务
################################################################################

set -e

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

PROJECT_DIR="/opt/xingchufang"
SERVICE_NAME="xingchufang-server"

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  星厨房内容创作助手 - 更新部署${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then
    echo -e "${YELLOW}请使用 root 用户或 sudo 运行此脚本${NC}"
    exit 1
fi

# 检查项目目录是否存在
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}项目目录不存在: $PROJECT_DIR${NC}"
    echo -e "${YELLOW}请先运行快速部署脚本: quick-start.sh${NC}"
    exit 1
fi

# 1. 备份当前版本
echo -e "${GREEN}[1/8] 备份当前版本...${NC}"
BACKUP_DIR="/opt/xingchufang-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p $BACKUP_DIR
cp -r $PROJECT_DIR/* $BACKUP_DIR/
echo -e "${GREEN}备份完成: $BACKUP_DIR${NC}"

# 2. 拉取最新代码
echo -e "${GREEN}[2/8] 拉取最新代码...${NC}"
cd $PROJECT_DIR
git pull origin main || git pull origin master
echo -e "${GREEN}代码更新完成${NC}"

# 3. 安装依赖
echo -e "${GREEN}[3/8] 安装依赖...${NC}"
cd $PROJECT_DIR
pnpm install
echo -e "${GREEN}依赖安装完成${NC}"

# 4. 构建后端
echo -e "${GREEN}[4/8] 构建后端...${NC}"
cd $PROJECT_DIR/server
pnpm build
cd ..
echo -e "${GREEN}后端构建完成${NC}"

# 5. 构建前端
echo -e "${GREEN}[5/8] 构建前端...${NC}"
cd $PROJECT_DIR
pnpm build:web
echo -e "${GREEN}前端构建完成${NC}"

# 6. 停止后端服务
echo -e "${GREEN}[6/8] 停止后端服务...${NC}"
pm2 stop $SERVICE_NAME || echo -e "${YELLOW}服务未运行${NC}"

# 7. 启动后端服务
echo -e "${GREEN}[7/8] 启动后端服务...${NC}"
pm2 start $PROJECT_DIR/server/dist/src/main.js --name $SERVICE_NAME
pm2 save

# 8. 重启 Nginx
echo -e "${GREEN}[8/8] 重启 Nginx...${NC}"
systemctl restart nginx
echo -e "${GREEN}Nginx 已重启${NC}"

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  更新部署完成！${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo -e "${YELLOW}常用命令：${NC}"
echo "  - 查看日志: pm2 logs $SERVICE_NAME"
echo "  - 查看状态: pm2 list"
echo "  - 回滚版本: 恢复 $BACKUP_DIR"
echo ""
