#!/bin/bash

################################################################################
# 星厨房 - 快速更新脚本（使用国内镜像）
#
# 功能：
# - 使用GitHub镜像拉取最新代码
# - 安装依赖
# - 重启后端服务
#
# 使用方法：
#   ./scripts/update-mirror.sh
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
PROJECT_DIR="/opt/xingchufang"

# 切换到项目目录
cd $PROJECT_DIR

echo ""
echo "========================================="
echo "  星厨房 - 快速更新脚本（国内镜像版）"
echo "========================================="
echo ""

# 1. 配置GitHub镜像
log_info "配置GitHub国内镜像..."
git remote set-url origin https://ghproxy.com/https://github.com/lio1985/xingchufang.git

# 2. 拉取最新代码
log_info "正在拉取最新代码..."
git pull origin main

# 3. 恢复原始URL（可选）
# git remote set-url origin https://github.com/lio1985/xingchufang.git

# 4. 安装依赖
log_info "安装依赖..."
pnpm install --ignore-scripts

# 5. 构建后端
log_info "构建后端服务..."
cd server && pnpm build && cd ..

# 6. 重启后端服务
log_info "重启后端服务..."
pm2 restart xingchufang-server

# 7. 查看服务状态
sleep 2
pm2 status

# 8. 查看最新日志
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
