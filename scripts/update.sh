#!/bin/bash

################################################################################
# 星厨房 - 快速更新脚本
#
# 功能：
# - 拉取最新代码
# - 安装依赖
# - 重启后端服务
#
# 使用方法：
#   ./scripts/update.sh
################################################################################

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 项目目录
PROJECT_DIR="/root/xingchufang"

# 切换到项目目录
cd $PROJECT_DIR

echo ""
echo "========================================="
echo "  星厨房 - 快速更新脚本"
echo "========================================="
echo ""

# 1. 拉取最新代码
log_info "正在拉取最新代码..."
git pull origin main

# 2. 安装依赖（如果 package.json 有变化）
log_info "检查依赖..."
if [ "package.json" -nt "node_modules" ]; then
    log_info "检测到依赖变化，正在安装..."
    pnpm install --ignore-scripts
else
    log_info "依赖无变化，跳过安装"
fi

# 3. 构建后端
log_info "构建后端服务..."
cd server && pnpm build && cd ..

# 4. 重启后端服务
log_info "重启后端服务..."
pm2 restart xingchufang-server

# 5. 查看服务状态
sleep 2
pm2 status

# 6. 查看最新日志
echo ""
log_info "最新日志："
pm2 logs xingchufang-server --lines 20 --nostream

echo ""
echo "========================================="
log_success "更新完成！"
echo "========================================="
echo ""
log_info "访问地址："
echo "  - 后端 API: http://14.103.111.91:3000"
echo "  - H5 前端: http://14.103.111.91:5000"
echo ""
log_info "常用命令："
echo "  - 查看日志: pm2 logs xingchufang-server"
echo "  - 查看状态: pm2 status"
echo "  - 重启服务: pm2 restart xingchufang-server"
echo "  - 停止服务: pm2 stop xingchufang-server"
echo ""
