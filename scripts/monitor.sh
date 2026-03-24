#!/bin/bash
# 服务监控脚本 - 自动检测和重启

WEB_PORT=5000
SERVER_PORT=3000
LOG_FILE="/tmp/service-monitor.log"

echo "$(date): 监控服务启动..." >> ${LOG_FILE}

while true; do
    # 检查前端服务
    if ! curl -s -o /dev/null -w "%{http_code}" --max-time 3 "http://localhost:${WEB_PORT}" 2>/dev/null | grep -q "200"; then
        echo "$(date): 前端服务异常，准备重启..." >> ${LOG_FILE}
        pkill -9 -f "taro build" 2>/dev/null || true
        sleep 2
        cd /workspace/projects && nohup pnpm dev:web > /tmp/web-dev.log 2>&1 &
        echo "$(date): 前端服务已重启" >> ${LOG_FILE}
    fi
    
    # 检查后端服务
    if ! curl -s -o /dev/null -w "%{http_code}" --max-time 3 "http://localhost:${SERVER_PORT}/api/hot-topics" 2>/dev/null | grep -q "200\|404"; then
        echo "$(date): 后端服务异常，准备重启..." >> ${LOG_FILE}
        pkill -9 -f "node dist/main" 2>/dev/null || true
        sleep 2
        cd /workspace/projects/server && nohup node dist/main.js > /tmp/server.log 2>&1 &
        echo "$(date): 后端服务已重启" >> ${LOG_FILE}
    fi
    
    # 每 30 秒检查一次
    sleep 30
done
