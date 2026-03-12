# 生产环境快速部署指南

本文档提供了快速部署星厨房创作助手的步骤。

## 📋 部署前准备清单

- [ ] 已注册 [Supabase 账号](https://supabase.com)
- [ ] 已注册微信小程序（已认证）
- [ ] 已准备服务器或云平台
- [ ] 已准备域名（推荐使用 HTTPS）

## 🚀 5 步快速部署

### 第 1 步：创建 Supabase 项目（5 分钟）

1. 访问 [https://supabase.com](https://supabase.com) 并登录
2. 点击 **"New Project"**
3. 填写项目信息：
   - Name: `star-kitchen-production`
   - Database Password: 设置强密码（**记住此密码**）
   - Region: 选择离用户最近的区域
4. 等待项目创建（1-2 分钟）
5. 进入 **Settings → API**，记录以下三个值：
   - `Project URL`
   - `anon public key`
   - `service_role key`

### 第 2 步：配置环境变量（5 分钟）

```bash
# 1. 复制环境变量模板
cp server/.env.production.example server/.env

# 2. 编辑环境变量文件
nano server/.env
```

**必填项**：

```bash
# 替换为你的 Supabase 配置
COZE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
COZE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
COZE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 生成 JWT_SECRET（使用以下命令）
# openssl rand -base64 64
JWT_SECRET=生成的随机字符串
JWT_EXPIRES_IN=7d

# 替换为你的微信小程序配置
TARO_APP_WEAPP_APPID=wx你的小程序AppID
WECHAT_APP_SECRET=你的小程序AppSecret

# 替换为你的域名
PROJECT_DOMAIN=https://api.yourdomain.com
```

### 第 3 步：初始化数据库（3 分钟）

1. 打开 Supabase Dashboard
2. 点击 **SQL Editor** → **New Query**
3. 复制 `server/database/migrations/init.sql` 文件内容
4. 点击 **Run** 执行脚本
5. 确认看到 "数据库初始化完成！" 提示

### 第 4 步：部署应用（10 分钟）

#### 方式 A：使用 Docker 部署（推荐）

```bash
# 1. 构建镜像
docker-compose build

# 2. 启动服务
docker-compose up -d

# 3. 查看日志
docker-compose logs -f
```

#### 方式 B：直接部署到服务器

```bash
# 1. 安装依赖
pnpm install

# 2. 构建应用
pnpm build

# 3. 使用 PM2 启动
npm install -g pm2
pm2 start ecosystem.config.cjs --env production

# 4. 设置开机自启
pm2 startup
pm2 save
```

### 第 5 步：配置 Nginx（可选，5 分钟）

```bash
# 1. 复制配置文件
cp nginx/nginx.conf.example nginx/nginx.conf

# 2. 修改配置中的域名和 SSL 证书路径
nano nginx/nginx.conf

# 3. 重启 Nginx
nginx -t  # 测试配置
nginx -s reload  # 重载配置
```

## ✅ 验证部署

```bash
# 1. 健康检查
curl https://api.yourdomain.com/api/health

# 2. 测试微信登录
curl -X POST https://api.yourdomain.com/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"code":"test_code"}'
```

预期响应：

```json
{
  "code": 200,
  "msg": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { ... }
  }
}
```

## 🔧 常见问题

### 问题 1：数据库连接失败

```bash
# 检查环境变量
cat server/.env | grep SUPABASE

# 测试 Supabase 连接
curl https://xxxxxxxxxxxx.supabase.co/rest/v1/
```

### 问题 2：微信登录失败

- 确认 `TARO_APP_WEAPP_APPID` 和 `WECHAT_APP_SECRET` 正确
- 确认小程序已发布或在开发工具中设置为开发版本

### 问题 3：应用无法启动

```bash
# 查看 PM2 日志
pm2 logs star-kitchen-api

# 查看 Docker 日志
docker-compose logs app
```

## 📚 详细文档

完整的部署文档请查看：[DEPLOYMENT.md](./DEPLOYMENT.md)

## 🆘 技术支持

如遇到问题：

1. 查看应用日志
2. 检查 Supabase Dashboard
3. 参考详细文档

---

**⚠️ 重要提醒**：

- 部署完成后，立即修改数据库密码和 JWT_SECRET
- 定期备份数据库
- 配置 HTTPS 和防火墙
- 监控应用运行状态
