# 部署脚本说明

## 📁 脚本列表

| 脚本文件 | 用途 | 使用场景 |
|---------|------|---------|
| `scripts/quick-start.sh` | 快速部署（首次部署） | 新服务器首次部署，安装基础环境 |
| `scripts/deploy.sh` | 完整部署 | 配置 Nginx、SSL、启动服务 |
| `scripts/update.sh` | 更新部署 | 更新代码、重新构建、重启服务 |
| `scripts/init-database.sql` | 数据库初始化 | 在 Supabase 中创建数据库表 |

---

## 🚀 使用流程

### 首次部署

```bash
# 1. 赋予执行权限
chmod +x scripts/*.sh

# 2. 运行快速部署（安装基础环境）
sudo ./scripts/quick-start.sh

# 3. 配置环境变量
cp .env.example .env
nano .env

# 4. 运行完整部署
sudo ./scripts/deploy.sh

# 5. 初始化数据库
# 在 Supabase SQL Editor 中执行 scripts/init-database.sql

# 6. 重启后端服务
pm2 restart xingchufang-server
```

### 更新部署

```bash
# 1. 拉取最新代码
cd /opt/xingchufang
git pull

# 2. 运行更新脚本
sudo ./scripts/update.sh
```

---

## 📋 环境变量配置

复制 `.env.example` 为 `.env` 并填写以下配置：

```bash
# 数据库
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key

# 对象存储
S3_ENDPOINT=https://s3.amazonaws.com
S3_ACCESS_KEY_ID=your_access_key
S3_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET=your_bucket_name
S3_REGION=us-east-1

# JWT
JWT_SECRET=your_very_long_random_secret_key_here

# 微信小程序
TARO_APP_WEAPP_APPID=wx1234567890abcdef
WECHAT_APP_SECRET=your_wechat_secret_here

# 超级管理员
SUPER_ADMIN_OPENID=your_admin_openid

# 生产环境
NODE_ENV=production
PROJECT_DOMAIN=https://api.your-domain.com
```

---

## 🔧 脚本功能说明

### quick-start.sh（快速部署）

**功能**：
- ✅ 安装基础工具（curl, git）
- ✅ 安装 Node.js 18
- ✅ 安装 pnpm
- ✅ 创建项目目录
- ✅ 提示上传代码

**使用时机**：
- 新服务器首次部署
- 需要安装基础环境

### deploy.sh（完整部署）

**功能**：
- ✅ 检查和安装 Node.js、pnpm、Nginx、PM2
- ✅ 安装项目依赖
- ✅ 构建后端和前端
- ✅ 配置 Nginx
- ✅ 启动后端服务
- ✅ 配置防火墙
- ✅ 配置 SSL 证书

**使用时机**：
- 快速部署完成后
- 需要配置 Nginx 和 SSL
- 需要启动所有服务

### update.sh（更新部署）

**功能**：
- ✅ 备份当前版本
- ✅ 拉取最新代码
- ✅ 安装依赖
- ✅ 构建后端和前端
- ✅ 重启后端服务
- ✅ 重启 Nginx

**使用时机**：
- 代码更新后重新部署
- 需要回滚到备份版本

### init-database.sql（数据库初始化）

**功能**：
- ✅ 创建所有数据库表
- ✅ 创建索引
- ✅ 创建触发器

**使用时机**：
- Supabase 项目创建后
- 需要初始化数据库

---

## 📊 部署检查清单

**快速部署**：
- [ ] 已运行 `quick-start.sh`
- [ ] 已配置 `.env` 文件
- [ ] 已初始化数据库
- [ ] 已运行 `deploy.sh`

**完整部署**：
- [ ] Node.js 已安装（18+）
- [ ] pnpm 已安装
- [ ] Nginx 已安装
- [ ] PM2 已安装
- [ ] 后端服务已启动
- [ ] 前端已构建
- [ ] SSL 证书已配置

**更新部署**：
- [ ] 已拉取最新代码
- [ ] 已运行 `update.sh`
- [ ] 服务已重启
- [ ] 功能测试通过

---

## 🐛 常见问题

### 1. 脚本无法执行

**解决方案**：
```bash
chmod +x scripts/*.sh
```

### 2. 权限不足

**解决方案**：
```bash
sudo ./scripts/deploy.sh
```

### 3. Node.js 版本不匹配

**解决方案**：
```bash
# 卸载旧版本
sudo apt-get remove nodejs

# 重新安装
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
sudo apt-get install -y nodejs
```

### 4. pnpm 命令不存在

**解决方案**：
```bash
npm install -g pnpm
```

### 5. Nginx 配置错误

**解决方案**：
```bash
# 测试配置
nginx -t

# 查看错误日志
tail -f /var/log/nginx/error.log
```

---

## 📞 技术支持

如遇到问题，请检查：

1. 脚本日志输出
2. PM2 进程日志：`pm2 logs xingchufang-server`
3. Nginx 日志：`tail -f /var/log/nginx/access.log`

---

## 🔄 部署流程图

```
首次部署：
  quick-start.sh → 配置 .env → deploy.sh → 初始化数据库 → 测试

更新部署：
  git pull → update.sh → 测试
```
