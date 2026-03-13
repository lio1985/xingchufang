#!/bin/bash
# 稳定启动脚本 - 确保端口 5000 严格绑定

set -e

echo "🚀 正在启动星厨房助手（稳定模式）..."

# 配置
WEB_PORT=5000
SERVER_PORT=3000
PID_FILE="/tmp/stable-dev.pid"
LOG_FILE="/tmp/stable-dev.log"

# 清理函数
cleanup() {
    echo "🧹 清理旧进程..."
    pkill -9 -f "taro build" 2>/dev/null || true
    pkill -9 -f "serve" 2>/dev/null || true
    
    # 释放端口
    for port in $WEB_PORT $SERVER_PORT; do
        local pids=$(ss -H -lntp 2>/dev/null | awk -v port="${port}" '$4 ~ ":"port"$"' | grep -o 'pid=[0-9]*' | cut -d= -f2 | sort -u)
        for pid in ${pids}; do
            kill -9 ${pid} 2>/dev/null || true
        done
    done
    
    sleep 2
    echo "✅ 清理完成"
}

# 健康检查
health_check() {
    local url=$1
    local max_attempts=${2:-30}
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -o /dev/null -w "%{http_code}" --max-time 2 "$url" 2>/dev/null | grep -q "200"; then
            return 0
        fi
        echo "⏳ 等待服务就绪 (${attempt}/${max_attempts})..."
        sleep 1
        attempt=$((attempt + 1))
    done
    return 1
}

# 启动前端
start_frontend() {
    echo "🎨 启动前端服务 (端口 ${WEB_PORT})..."
    cd /workspace/projects
    
    # 使用 npx 直接启动，确保端口严格绑定
    npx taro build --type h5 --watch --port ${WEB_PORT} > ${LOG_FILE} 2>&1 &
    local pid=$!
    echo $pid > ${PID_FILE}
    
    # 等待服务就绪
    if health_check "http://localhost:${WEB_PORT}"; then
        echo "✅ 前端服务已启动: http://localhost:${WEB_PORT}"
        return 0
    else
        echo "❌ 前端服务启动失败"
        return 1
    fi
}

# 启动后端
start_backend() {
    echo "🔧 启动后端服务 (端口 ${SERVER_PORT})..."
    cd /workspace/projects/server
    
    if [ -f dist/main.js ]; then
        node dist/main.js > /tmp/server.log 2>&1 &
    else
        npm run start:dev > /tmp/server.log 2>&1 &
    fi
    
    local pid=$!
    
    # 等待服务就绪
    if health_check "http://localhost:${SERVER_PORT}/api/hot-topics" 20; then
        echo "✅ 后端服务已启动: http://localhost:${SERVER_PORT}"
        return 0
    else
        echo "❌ 后端服务启动失败"
        return 1
    fi
}

# 主流程
case "${1:-}" in
    start)
        cleanup
        start_backend
        start_frontend
        echo ""
        echo "🎉 所有服务已启动！"
        echo "   前端: http://localhost:${WEB_PORT}"
        echo "   后端: http://localhost:${SERVER_PORT}"
        ;;
    stop)
        cleanup
        echo "🛑 服务已停止"
        ;;
    restart)
        cleanup
        sleep 1
        start_backend
        start_frontend
        ;;
    status)
        echo "端口状态:"
        ss -tlnp 2>/dev/null | grep -E ":(${WEB_PORT}|${SERVER_PORT})" || echo "无服务运行"
        ;;
    *)
        echo "用法: $0 {start|stop|restart|status}"
        exit 1
        ;;
esac
