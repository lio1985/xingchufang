#!/bin/bash
set -Eeuo pipefail

echo "🚀 Starting deployment..."

# 切换到工作目录
cd "${COZE_WORKSPACE_PATH}"

# 检查构建产物是否存在
if [ ! -f "server/dist/main.js" ]; then
    echo "❌ Error: server/dist/main.js not found"
    echo "This should have been built during the build phase"
    exit 1
fi

echo "✅ Build artifacts found"

# 检查 H5 构建产物是否存在
if [ ! -f "dist-web/index.html" ]; then
    echo "⚠️  Warning: dist-web/index.html not found, building H5 version..."
    cd "${COZE_WORKSPACE_PATH}"
    pnpm build:web
fi

echo "✅ H5 build artifacts found"

# 启动服务
start_service() {
    cd "${COZE_WORKSPACE_PATH}/server"

    # 强制使用 3000 端口，与 NestJS 配置一致
    local port=3000
    echo "🌐 Starting HTTP service on port ${port}..."

    # 使用 npm run start:prod 启动生产模式
    # 在后台启动并等待服务就绪
    npm run start:prod &
    local server_pid=$!

    # 等待服务启动并响应健康检查
    echo "⏳ Waiting for service to be ready..."
    local max_wait=60
    local waited=0

    while [ $waited -lt $max_wait ]; do
        if curl -s -o /dev/null -w "%{http_code}" "http://localhost:${port}/api/health" | grep -q "200"; then
            echo "✅ Service is ready and responding"
            return 0
        fi
        sleep 1
        waited=$((waited + 1))
    done

    echo "❌ Service failed to start within ${max_wait} seconds"
    kill $server_pid 2>/dev/null || true
    return 1
}

echo "Starting HTTP service in production mode..."
start_service || exit 1
