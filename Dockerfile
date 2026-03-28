# 多阶段构建 - 减小镜像大小
# ===================================
# 阶段 1: 构建应用
# ===================================
FROM node:20 AS builder

# 设置工作目录
WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制依赖文件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY server/package.json ./server/

# 安装所有依赖
RUN pnpm install

# 复制源代码
COPY . .

# 构建应用
RUN pnpm build

# 剔除开发依赖，只保留生产依赖
RUN pnpm prune --prod

# ===================================
# 阶段 2: 生产环境
# ===================================
FROM node:20

# 设置工作目录
WORKDIR /app

# 从构建阶段复制 node_modules（只包含生产依赖）
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server/node_modules ./server/node_modules

# 复制构建产物
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist-web ./dist-web
COPY --from=builder /app/server/dist ./server/dist

# 复制 package.json（运行时需要）
COPY package.json pnpm-workspace.yaml ./
COPY server/package.json ./server/

# 创建日志目录
RUN mkdir -p /app/logs

# 暴露端口
EXPOSE 3000 5000

# 环境变量
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 启动应用
CMD ["node", "server/dist/main.js"]
