#!/bin/bash

################################################################################
# 星厨房内容创作助手 - 自动化部署脚本
#
# 功能：
# - 自动检查和安装服务器环境
# - 配置 Nginx
# - 部署后端服务
# - 部署前端 H5
# - 配置 SSL 证书
# - 配置 PM2 进程管理
#
# 使用方法：
# chmod +x scripts/deploy.sh
# ./scripts/deploy.sh
################################################################################

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# 配置变量（根据实际情况修改）
PROJECT_NAME="xingchufang"
PROJECT_DIR="/opt/${PROJECT_NAME}"
DOMAIN="your-domain.com"  # 修改为你的域名
API_DOMAIN="api.xingchufang.cn"  # 修改为你的 API 域名
EMAIL="admin@xingchufang.cn"  # 修改为你的邮箱（用于 SSL 证书）

# 检查是否为 root 用户
check_root() {
    if [ "$EUID" -ne 0 ]; then
        log_error "请使用 root 用户或 sudo 运行此脚本"
        exit 1
    fi
}

# 检查操作系统
check_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$NAME
        VERSION=$VERSION_ID
        log_info "检测到操作系统: $OS $VERSION"
    else
        log_error "无法检测操作系统"
        exit 1
    fi
}

# 更新系统包
update_system() {
    log_info "更新系统包..."
    apt-get update -y
    apt-get upgrade -y
    log_success "系统包更新完成"
}

# 安装 Node.js
install_nodejs() {
    log_info "检查 Node.js 版本..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        log_info "已安装 Node.js 版本: $(node -v)"
        if [ "$NODE_VERSION" -lt 18 ]; then
            log_warn "Node.js 版本过低（需要 18+），正在安装最新版本..."
            curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
            apt-get install -y nodejs
        fi
    else
        log_info "安装 Node.js 18..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt-get install -y nodejs
    fi
    log_success "Node.js 版本: $(node -v)"
}

# 安装 pnpm
install_pnpm() {
    log_info "检查 pnpm..."
    if command -v pnpm &> /dev/null; then
        log_info "已安装 pnpm 版本: $(pnpm -v)"
    else
        log_info "安装 pnpm..."
        npm install -g pnpm
    fi
    log_success "pnpm 版本: $(pnpm -v)"
}

# 安装 Nginx
install_nginx() {
    log_info "检查 Nginx..."
    if command -v nginx &> /dev/null; then
        log_info "已安装 Nginx 版本: $(nginx -v 2>&1 | cut -d'/' -f2)"
    else
        log_info "安装 Nginx..."
        apt-get install -y nginx
    fi
    log_success "Nginx 已安装"
}

# 安装 PM2
install_pm2() {
    log_info "检查 PM2..."
    if command -v pm2 &> /dev/null; then
        log_info "已安装 PM2 版本: $(pm2 -v)"
    else
        log_info "安装 PM2..."
        npm install -g pm2
    fi
    log_success "PM2 版本: $(pm2 -v)"
}

# 创建项目目录
create_project_dir() {
    log_info "创建项目目录: $PROJECT_DIR"
    mkdir -p $PROJECT_DIR
    log_success "项目目录创建完成"
}

# 安装项目依赖
install_dependencies() {
    log_info "安装项目依赖..."
    cd $PROJECT_DIR
    pnpm install
    log_success "依赖安装完成"
}

# 构建后端
build_backend() {
    log_info "构建后端服务..."
    cd $PROJECT_DIR
    cd server
    pnpm build
    cd ..
    log_success "后端构建完成"
}

# 构建前端
build_frontend() {
    log_info "构建前端 H5..."
    cd $PROJECT_DIR
    pnpm build:web
    log_success "前端构建完成"
}

# 配置环境变量
configure_env() {
    log_info "配置环境变量..."
    if [ ! -f "$PROJECT_DIR/.env" ]; then
        log_warn ".env 文件不存在，请手动配置以下环境变量："
        cat > $PROJECT_DIR/.env.example << EOF
# 数据库
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# 对象存储
S3_ENDPOINT=https://s3.amazonaws.com
S3_ACCESS_KEY_ID=your_access_key
S3_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET=your_bucket_name
S3_REGION=us-east-1

# JWT
JWT_SECRET=your_jwt_secret_key

# 微信小程序
TARO_APP_WEAPP_APPID=your_wechat_appid
WECHAT_APP_SECRET=your_wechat_secret

# 超级管理员
SUPER_ADMIN_OPENID=your_admin_openid

# 生产环境
NODE_ENV=production
PROJECT_DOMAIN=https://$API_DOMAIN
EOF
        log_warn "请复制 .env.example 为 .env 并填写正确的配置"
        log_warn "命令: cp $PROJECT_DIR/.env.example $PROJECT_DIR/.env"
    else
        log_info ".env 文件已存在"
    fi
}

# 配置 Nginx
configure_nginx() {
    log_info "配置 Nginx..."
    
    # 创建 Nginx 配置文件
    cat > /etc/nginx/sites-available/$PROJECT_NAME << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # 前端 H5
    location / {
        root $PROJECT_DIR/dist-web;
        try_files \$uri \$uri/ /index.html;
    }

    # 后端 API 代理
    location /api {
        proxy_pass http://localhost:3000/api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;
}
EOF

    # 启用配置
    ln -sf /etc/nginx/sites-available/$PROJECT_NAME /etc/nginx/sites-enabled/

    # 删除默认配置
    rm -f /etc/nginx/sites-enabled/default

    # 测试 Nginx 配置
    nginx -t
    systemctl restart nginx
    log_success "Nginx 配置完成并已重启"
}

# 配置 SSL 证书
configure_ssl() {
    log_info "配置 SSL 证书..."
    
    # 安装 Certbot
    if ! command -v certbot &> /dev/null; then
        log_info "安装 Certbot..."
        apt-get install -y certbot python3-certbot-nginx
    fi

    # 获取 SSL 证书
    log_info "获取 SSL 证书（域名: $DOMAIN）..."
    certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $EMAIL

    # 设置自动续期
    certbot renew --dry-run
    log_success "SSL 证书配置完成"
}

# 启动后端服务
start_backend() {
    log_info "启动后端服务..."
    cd $PROJECT_DIR
    pm2 delete $PROJECT_NAME-server 2>/dev/null || true
    pm2 start $PROJECT_DIR/server/dist/src/main.js --name $PROJECT_NAME-server
    pm2 save
    pm2 startup
    log_success "后端服务已启动"
}

# 配置防火墙
configure_firewall() {
    log_info "配置防火墙..."
    if command -v ufw &> /dev/null; then
        ufw allow 22/tcp
        ufw allow 80/tcp
        ufw allow 443/tcp
        ufw --force enable
        log_success "防火墙配置完成"
    else
        log_warn "未检测到 ufw，跳过防火墙配置"
    fi
}

# 显示部署信息
show_deployment_info() {
    echo ""
    echo "========================================="
    log_success "部署完成！"
    echo "========================================="
    echo ""
    log_info "访问地址："
    echo "  - H5 前端: https://$DOMAIN"
    echo "  - 后端 API: https://$DOMAIN/api"
    echo ""
    log_info "常用命令："
    echo "  - 查看后端日志: pm2 logs $PROJECT_NAME-server"
    echo "  - 重启后端服务: pm2 restart $PROJECT_NAME-server"
    echo "  - 停止后端服务: pm2 stop $PROJECT_NAME-server"
    echo "  - 查看 Nginx 日志: tail -f /var/log/nginx/access.log"
    echo "  - 重启 Nginx: systemctl restart nginx"
    echo ""
    log_info "后续步骤："
    echo "  1. 配置 .env 文件中的环境变量"
    echo "  2. 在 Supabase 中创建数据库表"
    echo "  3. 配置对象存储（S3/OSS）"
    echo "  4. 在微信小程序后台配置服务器域名"
    echo "  5. 上传并发布微信小程序"
    echo ""
    echo "========================================="
}

# 主函数
main() {
    echo ""
    echo "========================================="
    echo "  星厨房内容创作助手 - 自动化部署脚本"
    echo "========================================="
    echo ""

    check_root
    check_os
    update_system
    install_nodejs
    install_pnpm
    install_nginx
    install_pm2
    create_project_dir

    # 提示用户上传代码
    log_warn "请确保代码已上传到 $PROJECT_DIR 目录"
    read -p "代码已上传，是否继续？(y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_error "部署已取消"
        exit 1
    fi

    install_dependencies
    configure_env
    build_backend
    build_frontend
    configure_nginx
    start_backend
    configure_firewall

    # 询问是否配置 SSL
    echo ""
    read -p "是否配置 SSL 证书？(需要域名已解析到服务器) (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        configure_ssl
    else
        log_warn "跳过 SSL 证书配置，可稍后手动运行: certbot --nginx -d $DOMAIN"
    fi

    show_deployment_info
}

# 执行主函数
main
