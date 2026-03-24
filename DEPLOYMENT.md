# 星厨房创作助手 - 生产环境部署指南

本文档详细介绍如何将星厨房创作助手部署到生产环境。

## 目录

- [前置要求](#前置要求)
- [第一步：创建 Supabase 项目](#第一步创建-supabase-项目)
- [第二步：配置环境变量](#第二步配置环境变量)
- [第三步：初始化数据库](#第三步初始化数据库)
- [第四步：配置对象存储（可选）](#第四步配置对象存储可选)
- [第五步：部署应用](#第五步部署应用)
- [第六步：验证部署](#第六步验证部署)
- [常见问题](#常见问题)

---

## 前置要求

在开始部署之前，请确保你已经准备好：

- ✅ [Supabase 账号](https://supabase.com)（免费）
- ✅ 微信小程序账号（已认证）
- ✅ 服务器或云平台（推荐：阿里云、腾讯云、华为云等）
- ✅ 域名（可选，推荐使用 HTTPS）
- ✅ Node.js 18+ 和 pnpm

---

## 第一步：创建 Supabase 项目

### 1.1 注册 Supabase

1. 访问 [https://supabase.com](https://supabase.com)
2. 点击 **"Start your project"** 或 **"Sign Up"**
3. 使用 GitHub 或邮箱注册账号

### 1.2 创建新项目

1. 登录后，点击左侧菜单的 **"New Project"**
2. 填写项目信息：

   | 字段 | 说明 | 示例 |
   |------|------|------|
   | **Name** | 项目名称 | `star-kitchen-production` |
   | **Database Password** | 数据库密码（强密码） | `MyStr0ngP@ssw0rd!2024` |
   | **Region** | 数据库区域 | `Northeast Asia (Seoul)` 或 `Southeast Asia (Singapore)` |

3. 等待项目创建完成（约 1-2 分钟）

### 1.3 获取 API 凭据

项目创建后：

1. 点击左侧菜单 **Settings → API**
2. 记录以下三个信息（**请妥善保管**）：

   ```
   Project URL:        https://xxxxxxxxxxxx.supabase.co
   anon public:        eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   service_role:       eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

**⚠️ 安全提醒**：
- `service_role key` 拥有超级权限，**只能在服务器端使用**，绝不要泄露
- `anon key` 可以在客户端使用，但需要配置 RLS（行级安全策略）保护数据

---

## 第二步：配置环境变量

### 2.1 创建 `.env.production` 文件

在项目根目录下创建 `server/.env.production` 文件：

```bash
# ===================================
# 数据库配置（必填）
# ===================================
COZE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
COZE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
COZE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ===================================
# JWT 认证配置（必填）
# ===================================
JWT_SECRET=请生成一个长随机字符串_至少32位
JWT_EXPIRES_IN=7d

# ===================================
# 应用配置
# ===================================
APP_NAME=星厨房内容创作助手
NODE_ENV=production

# ===================================
# 微信小程序配置（必填）
# ===================================
TARO_APP_WEAPP_APPID=wx你的小程序AppID
WECHAT_APP_SECRET=你的小程序AppSecret

# ===================================
# 超级管理员配置（可选）
# ===================================
SUPER_ADMIN_OPENID=管理员的微信openid

# ===================================
# 生产环境域名（必填）
# ===================================
PROJECT_DOMAIN=https://api.yourdomain.com

# ===================================
# 对象存储配置（可选）
# ===================================
COZE_S3_ENDPOINT=https://s3.amazonaws.com
COZE_S3_ACCESS_KEY_ID=your-access-key-id
COZE_S3_SECRET_ACCESS_KEY=your-secret-access-key
COZE_S3_BUCKET=your-bucket-name
COZE_S3_REGION=us-east-1

# ===================================
# 端口配置
# ===================================
SERVER_PORT=3000
WEB_PORT=5000
API_TIMEOUT=30000
```

### 2.2 生成 JWT_SECRET

使用以下命令生成一个安全的 JWT_SECRET：

```bash
# 方法 1：使用 openssl
openssl rand -base64 64

# 方法 2：使用 Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

将生成的随机字符串填入 `JWT_SECRET`。

### 2.3 获取微信小程序配置

1. 登录 [微信公众平台](https://mp.weixin.qq.com)
2. 进入 **开发 → 开发管理 → 开发设置**
3. 获取 `AppID`
4. 在 **开发 → 开发管理 → 开发设置 → 开发者ID** 获取 `AppSecret`

**⚠️ 注意**：AppSecret 不要直接写入代码，必须通过环境变量配置。

---

## 第三步：初始化数据库

### 3.1 进入 Supabase SQL Editor

1. 打开 Supabase Dashboard
2. 点击左侧菜单 **SQL Editor**
3. 点击 **"New Query"**

### 3.2 创建数据表

复制以下 SQL 并执行：

```sql
-- ===================================
-- 用户表
-- ===================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  openid VARCHAR(255) UNIQUE NOT NULL,
  employee_id VARCHAR(50),
  nickname VARCHAR(100),
  avatar_url TEXT,
  role VARCHAR(20) DEFAULT 'user',
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_openid ON users(openid);
CREATE INDEX IF NOT EXISTS idx_users_employee_id ON users(employee_id);

-- ===================================
-- 词库表
-- ===================================
CREATE TABLE IF NOT EXISTS lexicons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  usage_example TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- 欢迎语表
-- ===================================
CREATE TABLE IF NOT EXISTS welcome_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  category VARCHAR(50),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- 产品表
-- ===================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  price DECIMAL(10,2),
  image_url TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- 直播脚本表
-- ===================================
CREATE TABLE IF NOT EXISTS live_scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'draft',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- 对话记录表
-- ===================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  message TEXT NOT NULL,
  role VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);

-- ===================================
-- 创建触发器：自动更新 updated_at
-- ===================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为所有需要的表添加触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lexicons_updated_at BEFORE UPDATE ON lexicons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_live_scripts_updated_at BEFORE UPDATE ON live_scripts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 3.3 配置行级安全策略（RLS）

```sql
-- ===================================
-- 启用 RLS
-- ===================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE lexicons ENABLE ROW LEVEL SECURITY;
ALTER TABLE welcome_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- ===================================
-- 用户表策略
-- ===================================
-- 允许所有人读取用户基本信息
CREATE POLICY "允许公开读取用户" ON users
  FOR SELECT USING (true);

-- 允许用户更新自己的信息
CREATE POLICY "允许用户更新自己" ON users
  FOR UPDATE USING (auth.uid()::text = openid);

-- ===================================
-- 词库表策略
-- ===================================
-- 允许认证用户读取词库
CREATE POLICY "允许认证用户读取词库" ON lexicons
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- 允许认证用户创建词库
CREATE POLICY "允许认证用户创建词库" ON lexicons
  FOR INSERT WITH CHECK (created_by = auth.uid());

-- ===================================
-- 对话记录策略
-- ===================================
-- 允许用户读取自己的对话记录
CREATE POLICY "允许用户读取自己的对话" ON conversations
  FOR SELECT USING (user_id = auth.uid());

-- 允许用户创建对话记录
CREATE POLICY "允许用户创建对话" ON conversations
  FOR INSERT WITH CHECK (user_id = auth.uid());
```

---

## 第四步：配置对象存储（可选）

如果需要上传文件（如图片、文档），需要配置对象存储服务。

### 4.1 选择存储服务

推荐使用以下服务之一：

| 服务 | 说明 | 免费额度 |
|------|------|---------|
| **阿里云 OSS** | 国内速度快 | 5GB |
| **腾讯云 COS** | 国内速度快 | 50GB |
| **AWS S3** | 全球覆盖 | 5GB |
| **Supabase Storage** | 与数据库集成 | 1GB |

### 4.2 配置环境变量

在 `.env.production` 中添加：

```bash
# 示例：使用阿里云 OSS
COZE_S3_ENDPOINT=https://oss-cn-hangzhou.aliyuncs.com
COZE_S3_ACCESS_KEY_ID=your-access-key-id
COZE_S3_SECRET_ACCESS_KEY=your-secret-access-key
COZE_S3_BUCKET=star-kitchen-production
COZE_S3_REGION=oss-cn-hangzhou
```

---

## 第五步：部署应用

### 5.1 服务器准备

确保服务器已安装以下软件：

```bash
# 安装 Node.js 18+
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# 安装 pnpm
npm install -g pnpm
```

### 5.2 部署方式选择

#### 方式 1：直接部署到服务器

```bash
# 1. 克隆代码
git clone <your-repo-url>
cd star-kitchen

# 2. 安装依赖
pnpm install

# 3. 复制环境变量
cp server/.env.production server/.env

# 4. 构建应用
pnpm build

# 5. 启动应用（使用 PM2）
npm install -g pm2
pm2 start ecosystem.config.cjs --env production
```

#### 方式 2：使用 Docker 部署

创建 `Dockerfile`：

```dockerfile
# 多阶段构建
FROM node:18-alpine AS builder

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制 package.json
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建应用
RUN pnpm build

# 生产镜像
FROM node:18-alpine

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制 package.json
COPY package.json pnpm-lock.yaml ./

# 只安装生产依赖
RUN pnpm install --prod --frozen-lockfile

# 复制构建产物
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/package.json ./server/

# 复制环境变量
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# 暴露端口
EXPOSE 3000 5000

# 启动应用
CMD ["node", "server/dist/main.js"]
```

创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
      - "5000:5000"
    env_file:
      - server/.env.production
    restart: unless-stopped
```

启动：

```bash
docker-compose up -d
```

#### 方式 3：使用云平台部署

**推荐平台**：

- [Vercel](https://vercel.com) - 适合 Serverless 部署
- [Railway](https://railway.app) - 一键部署
- [Render](https://render.com) - 免费额度充足

以 Railway 为例：

1. 连接 GitHub 仓库
2. 添加环境变量（从 `.env.production` 复制）
3. 自动部署

### 5.3 配置 Nginx 反向代理（推荐）

如果使用独立服务器，建议配置 Nginx：

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    # 前端
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # 后端 API
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # 文件上传大小限制
    client_max_body_size 10M;
}
```

---

## 第六步：验证部署

### 6.1 健康检查

```bash
# 检查后端 API
curl https://api.yourdomain.com/api/health

# 检查前端
curl https://api.yourdomain.com/
```

### 6.2 测试微信登录

使用 Postman 或 curl 测试：

```bash
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
    "user": {
      "id": "xxx",
      "openid": "xxx",
      "employeeId": "xxx",
      "nickname": "xxx",
      "role": "admin"
    }
  }
}
```

---

## 常见问题

### Q1: 数据库连接失败

**原因**：环境变量配置错误

**解决方案**：
1. 检查 `COZE_SUPABASE_URL` 是否正确
2. 确认 `COZE_SUPABASE_ANON_KEY` 是否填写正确
3. 在 Supabase Dashboard 中测试连接

### Q2: 微信登录失败

**原因**：小程序 AppID/AppSecret 错误

**解决方案**：
1. 检查微信公众平台中的 AppID 和 AppSecret
2. 确认小程序已发布或设置为开发版本
3. 检查用户信息是否正确

### Q3: 文件上传失败

**原因**：对象存储配置错误

**解决方案**：
1. 检查 S3 配置是否正确
2. 确认 Bucket 是否存在且有写入权限
3. 检查 Access Key 和 Secret Key

### Q4: 应用启动后无法访问

**原因**：防火墙或端口配置问题

**解决方案**：
1. 检查服务器防火墙规则
2. 确认端口 3000 和 5000 已开放
3. 检查 Nginx 配置

---

## 安全建议

1. **定期更新依赖**：
   ```bash
   pnpm update
   ```

2. **配置 HTTPS**：
   - 使用 Let's Encrypt 免费证书
   - 强制 HTTPS 重定向

3. **备份数据库**：
   - 定期备份 Supabase 数据
   - 配置自动备份策略

4. **监控日志**：
   - 配置日志收集（如 ELK、Sentry）
   - 设置告警规则

5. **限制访问**：
   - 配置 IP 白名单
   - 启用速率限制

---

## 技术支持

如遇到问题，请：

1. 查看日志：`pm2 logs star-kitchen`
2. 检查 Supabase Dashboard
3. 提交 Issue 到 GitHub

---

**部署完成后，请立即修改数据库密码和 JWT_SECRET！**
