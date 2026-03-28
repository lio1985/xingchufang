# ===================================
# 多阶段构建 - 仅后端
# ===================================
FROM node:20 AS builder

WORKDIR /app

# 复制 server 目录的所有文件
COPY server ./server

# 在 server 目录安装所有依赖（包括 devDependencies）
WORKDIR /app/server
RUN npm install --legacy-peer-deps

# 复制根目录的 tsconfig.json
COPY tsconfig.json /app/

# 构建后端
RUN npm run build

# ===================================
# 生产环境
# ===================================
FROM node:20

WORKDIR /app

# 复制 server 目录
COPY server ./server

# 在 server 目录安装生产依赖
WORKDIR /app/server
RUN npm install --only=production --legacy-peer-deps

# 从构建阶段复制后端产物
COPY --from=builder /app/server/dist ./dist

# 创建必要目录
RUN mkdir -p /app/logs /app/uploads

# 暴露端口
EXPOSE 3000

# 环境变量
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 启动应用
CMD ["node", "dist/main.js"]
