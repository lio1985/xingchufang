# 🎉 部署脚本已创建完成

## 📁 已创建的文件

| 文件路径 | 说明 |
|---------|------|
| `scripts/quick-start.sh` | 快速部署脚本（首次部署，安装基础环境） |
| `scripts/deploy.sh` | 完整部署脚本（配置 Nginx、SSL、启动服务） |
| `scripts/update.sh` | 更新部署脚本（更新代码、重新构建） |
| `scripts/init-database.sql` | 数据库初始化脚本（Supabase） |
| `.env.example` | 环境变量模板 |
| `docs/DEPLOYMENT-GUIDE.md` | 完整部署指南 |
| `docs/SCRIPTS-README.md` | 脚本使用说明 |

---

## 🚀 快速开始

### 步骤 1：上传代码到服务器

```bash
# 方法 1：使用 Git（推荐）
git clone your-repo-url /opt/xingchufang

# 方法 2：使用 SCP
scp -r ./* user@your-server:/opt/xingchufang/
```

### 步骤 2：运行快速部署

```bash
cd /opt/xingchufang
sudo ./scripts/quick-start.sh
```

**快速部署脚本会完成**：
- ✅ 安装 Node.js 18
- ✅ 安装 pnpm
- ✅ 创建项目目录
- ✅ 提示上传代码

### 步骤 3：配置环境变量

```bash
cd /opt/xingchufang

# 复制环境变量模板
cp .env.example .env

# 编辑环境变量
nano .env
```

**必须配置的环境变量**：

```bash
# 数据库（Supabase）
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key

# 对象存储（S3/OSS）
S3_ENDPOINT=https://s3.amazonaws.com
S3_ACCESS_KEY_ID=your_access_key
S3_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET=your_bucket_name
S3_REGION=us-east-1

# JWT（生成一个随机的长字符串）
JWT_SECRET=your_very_long_random_secret_key_here

# 微信小程序
TARO_APP_WEAPP_APPID=wx1234567890abcdef
WECHAT_APP_SECRET=your_wechat_secret_here

# 超级管理员
SUPER_ADMIN_OPENID=

# 生产环境
NODE_ENV=production
PROJECT_DOMAIN=https://api.your-domain.com
```

### 步骤 4：运行完整部署

```bash
cd /opt/xingchufang
sudo ./scripts/deploy.sh
```

**完整部署脚本会完成**：
- ✅ 检查和安装所有依赖
- ✅ 构建后端和前端
- ✅ 配置 Nginx
- ✅ 启动后端服务
- ✅ 配置防火墙
- ✅ 配置 SSL 证书（可选）

### 步骤 5：初始化数据库

1. 登录 Supabase 控制台
2. 进入 SQL Editor
3. 执行 `scripts/init-database.sql` 脚本

### 步骤 6：重启后端服务

```bash
cd /opt/xingchufang
pm2 restart xingchufang-server

# 查看日志
pm2 logs xingchufang-server
```

---

## 🔄 更新部署

当代码更新后，运行以下命令：

```bash
cd /opt/xingchufang
sudo ./scripts/update.sh
```

**更新部署脚本会完成**：
- ✅ 备份当前版本
- ✅ 拉取最新代码
- ✅ 安装依赖
- ✅ 构建后端和前端
- ✅ 重启服务

---

## 📋 部署检查清单

**服务器准备**：
- [ ] 服务器已准备（Ubuntu 20.04+ / CentOS 7+）
- [ ] 域名已解析到服务器
- [ ] Supabase 项目已创建
- [ ] 对象存储（S3/OSS）已配置

**首次部署**：
- [ ] 代码已上传到 `/opt/xingchufang`
- [ ] 已运行 `quick-start.sh`
- [ ] `.env` 文件已配置
- [ ] 已运行 `deploy.sh`
- [ ] 数据库已初始化
- [ ] 后端服务已启动

**测试验证**：
- [ ] 后端 API 可访问：`curl https://api.your-domain.com/api/welcome`
- [ ] 前端页面可访问：`curl https://your-domain.com`
- [ ] PM2 进程正常：`pm2 list`
- [ ] Nginx 正常运行：`systemctl status nginx`

**微信小程序**：
- [ ] 服务器域名已配置
- [ ] 代码已上传
- [ ] 已提交审核

---

## 🔧 常用运维命令

### 后端服务

```bash
# 查看进程
pm2 list

# 查看日志
pm2 logs xingchufang-server

# 重启服务
pm2 restart xingchufang-server

# 停止服务
pm2 stop xingchufang-server

# 查看详细信息
pm2 show xingchufang-server
```

### Nginx

```bash
# 测试配置
nginx -t

# 重启服务
systemctl restart nginx

# 查看状态
systemctl status nginx

# 查看访问日志
tail -f /var/log/nginx/access.log

# 查看错误日志
tail -f /var/log/nginx/error.log
```

### SSL 证书

```bash
# 续期证书
certbot renew

# 测试续期
certbot renew --dry-run
```

---

## 📚 相关文档

- [完整部署指南](./DEPLOYMENT-GUIDE.md)
- [脚本使用说明](./SCRIPTS-README.md)
- [微信小程序发布指南](./WECHAT-MINI-PROGRAM-RELEASE-GUIDE.md)

---

## 🎯 下一步

1. **准备服务器**
   - 购买服务器（推荐：2核4G）
   - 配置域名解析

2. **准备第三方服务**
   - 注册 Supabase（数据库）
   - 配置对象存储（S3/OSS）
   - 注册微信小程序

3. **执行部署**
   - 按照"快速开始"步骤执行

4. **配置微信小程序**
   - 在微信公众平台配置服务器域名
   - 上传代码并提交审核

5. **测试功能**
   - 测试用户登录
   - 测试核心功能
   - 测试管理员功能

---

## 🐛 常见问题

### 1. 脚本无法执行

```bash
chmod +x scripts/*.sh
```

### 2. 权限不足

```bash
sudo ./scripts/deploy.sh
```

### 3. Node.js 版本不匹配

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
sudo apt-get install -y nodejs
```

### 4. 数据库连接失败

检查 `.env` 文件中的 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY` 是否正确。

### 5. SSL 证书配置失败

确保域名已解析到服务器，且 80 端口可访问。

---

## 📞 技术支持

如遇到问题，请检查：

1. 脚本日志输出
2. PM2 进程日志：`pm2 logs xingchufang-server`
3. Nginx 日志：`tail -f /var/log/nginx/error.log`

---

## ✅ 部署成功

当你看到以下信息时，说明部署成功：

```
=========================================
  部署完成！
=========================================

访问地址：
  - H5 前端: https://your-domain.com
  - 后端 API: https://your-domain.com/api

常用命令：
  - 查看后端日志: pm2 logs xingchufang-server
  - 重启后端服务: pm2 restart xingchufang-server
  - 查看 Nginx 日志: tail -f /var/log/nginx/access.log

后续步骤：
  1. 配置 .env 文件中的环境变量
  2. 在 Supabase 中创建数据库表
  3. 配置对象存储（S3/OSS）
  4. 在微信小程序后台配置服务器域名
  5. 上传并发布微信小程序
=========================================
```

---

🎉 **恭喜！你的星厨房内容创作助手已成功部署！**
