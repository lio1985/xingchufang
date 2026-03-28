# ===================================
# 多阶段构建 - 仅后端
# ===================================
FROM node:20 AS builder

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 创建完整的 workspace 结构
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY server/package.json ./server/package.json

# 安装所有依赖（包括 server 的依赖）
RUN pnpm install --frozen-lockfile --ignore-scripts

# 复制后端源代码
COPY server ./server
COPY tsconfig.json ./

# 构建后端
RUN cd server && pnpm build

# ===================================
# 生产环境
# ===================================
FROM node:20

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 创建 workspace 结构
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY server/package.json ./server/package.json

# 安装生产依赖
RUN pnpm install --prod --frozen-lockfile --ignore-scripts

# 从构建阶段复制后端产物
COPY --from=builder /app/server/dist ./server/dist

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
CMD ["node", "server/dist/main.js"]
