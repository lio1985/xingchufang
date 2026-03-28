# 星厨房部署指南

## 适用于 2核2G 服务器

---

## 架构说明

```
┌─────────────────────────────────────────────────────────┐
│                      Nginx (80/443)                      │
│  ┌─────────────────┐    ┌─────────────────────────────┐ │
│  │  静态文件托管    │    │      API 反向代理           │ │
│  │  / → dist-web   │    │  /api → app:3000           │ │
│  └─────────────────┘    └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│  App (3000)   │   │ Redis (6379)  │   │  dist-web/    │
│  NestJS 后端   │   │    缓存        │   │  前端静态文件  │
└───────────────┘   └───────────────┘   └───────────────┘
```

---

## 部署步骤

### 第一步：本地构建

在开发机器上执行：

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 安装依赖
pnpm install

# 3. 构建前端
pnpm build:weapp   # 微信小程序
pnpm build:web     # H5

# 4. 构建后端
pnpm build:server

# 5. 打包部署文件
tar -czvf deploy.tar.gz \
    Dockerfile \
    docker-compose.yml \
    package.json \
    pnpm-lock.yaml \
    pnpm-workspace.yaml \
    tsconfig.json \
    server/package.json \
    server/dist \
    server/src \
    nginx \
    dist-web
```

### 第二步：上传到服务器

```bash
# 上传部署包
scp deploy.tar.gz root@your-server-ip:/root/
```

### 第三步：服务器部署

```bash
# 1. 登录服务器
ssh root@your-server-ip

# 2. 解压部署包
cd /root
tar -xzvf deploy.tar.gz

# 3. 配置环境变量（如果需要）
cp server/.env.example server/.env
nano server/.env

# 4. 构建并启动服务
docker compose up -d --build

# 5. 查看服务状态
docker compose ps

# 6. 查看日志
docker compose logs -f app
```

### 第四步：验证部署

```bash
# 检查后端 API
curl http://localhost:3000/api/health

# 检查前端页面
curl http://localhost:80

# 检查所有服务
docker compose ps
```

---

## 常用命令

```bash
# 查看服务状态
docker compose ps

# 查看日志
docker compose logs -f app

# 重启服务
docker compose restart

# 停止服务
docker compose down

# 更新部署
docker compose down
docker compose up -d --build
```

---

## 文件结构

```
/root/
├── Dockerfile           # 后端构建文件
├── docker-compose.yml   # Docker 编排配置
├── package.json         # 项目依赖
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── tsconfig.json
├── server/
│   ├── package.json
│   ├── dist/           # 后端构建产物
│   └── src/
├── nginx/
│   └── nginx.conf      # Nginx 配置
└── dist-web/           # 前端静态文件
    ├── index.html
    └── assets/
```

---

## 端口说明

| 端口 | 服务 | 说明 |
|------|------|------|
| 80 | Nginx | HTTP 入口 |
| 443 | Nginx | HTTPS 入口 |
| 3000 | App | 后端 API（容器内部） |
| 6379 | Redis | 缓存服务（容器内部） |

---

## 故障排查

### 服务无法启动

```bash
# 查看详细日志
docker compose logs app

# 检查环境变量
docker compose exec app env
```

### 前端页面空白

```bash
# 检查静态文件是否存在
docker compose exec nginx ls /usr/share/nginx/html

# 检查 nginx 配置
docker compose exec nginx nginx -t
```

### API 无法访问

```bash
# 检查后端服务
curl http://localhost:3000/api/health

# 检查 nginx 代理
docker compose logs nginx
```

---

## 更新部署

当有新版本发布时：

```bash
# 1. 本地重新构建
pnpm build:weapp
pnpm build:web
pnpm build:server

# 2. 重新打包
tar -czvf deploy.tar.gz ...

# 3. 上传并部署
scp deploy.tar.gz root@your-server-ip:/root/
ssh root@your-server-ip "cd /root && tar -xzvf deploy.tar.gz && docker compose down && docker compose up -d --build"
```

---

## 注意事项

1. **服务器资源**：2核2G 服务器适合此部署方案，前端本地构建避免服务器资源不足
2. **数据库**：使用 Supabase 云数据库，无需本地部署
3. **SSL 证书**：如需 HTTPS，请配置 nginx/ssl 目录下的证书文件
4. **日志**：日志文件存储在 `/root/logs/` 目录
