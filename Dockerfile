# 多阶段构建 - 减小镜像大小
# ===================================
# 阶段 1: 构建应用
# ===================================
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install

# 复制源代码
COPY . .

# 构建应用
RUN pnpm build

# ===================================
# 阶段 2: 生产环境
# ===================================
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 安装 serve（用于服务静态文件）
RUN npm install -g serve

# 复制依赖文件
COPY package.json pnpm-lock.yaml server/package.json ./

# 只安装生产依赖
RUN pnpm install --prod

# 复制构建产物
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist-web ./dist-web
COPY --from=builder /app/server/dist ./server/dist

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
