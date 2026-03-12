# 星厨房内容创作助手 - 部署指南

## 📋 部署前准备

### 1. 服务器准备

- **服务器要求**：
  - CPU: 2核及以上
  - 内存: 4GB 及以上
  - 硬盘: 40GB 及以上
  - 系统: Ubuntu 20.04+ / CentOS 7+
  - Node.js: 18.x 及以上
  - Nginx: 1.18+

### 2. 域名准备

- 主域名：`your-domain.com`（H5 前端访问）
- API 域名：`api.your-domain.com`（后端 API 访问）
- 确保域名已解析到服务器 IP

### 3. 第三方服务准备

| 服务 | 用途 | 获取方式 |
|------|------|----------|
| Supabase | PostgreSQL 数据库 | https://supabase.com |
| S3/OSS | 对象存储（文件/图片） | AWS / 阿里云 / 腾讯云 |
| 微信小程序 | 用户登录 | 微信公众平台 |

---

## 🚀 快速部署（推荐）

### 步骤 1：上传代码到服务器

```bash
# 方法 1：使用 Git（推荐）
git clone your-repo-url /opt/xingchufang
cd /opt/xingchufang

# 方法 2：使用 SCP
scp -r ./* user@your-server:/opt/xingchufang/
```

### 步骤 2：运行部署脚本

```bash
# 赋予执行权限
chmod +x scripts/deploy.sh

# 运行部署脚本
sudo ./scripts/deploy.sh
```

**部署脚本会自动完成**：
- ✅ 检查和安装 Node.js、pnpm、Nginx、PM2
- ✅ 安装项目依赖
- ✅ 构建后端和前端
- ✅ 配置 Nginx
- ✅ 启动后端服务
- ✅ 配置防火墙
- ✅ 配置 SSL 证书（可选）

### 步骤 3：配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量
nano .env
```

**必须配置的环境变量**：

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

# JWT（请生成一个随机的长字符串）
JWT_SECRET=your_very_long_random_secret_key_here

# 微信小程序
TARO_APP_WEAPP_APPID=wx1234567890abcdef
WECHAT_APP_SECRET=your_wechat_secret_here

# 超级管理员（稍后获取）
SUPER_ADMIN_OPENID=
```

### 步骤 4：初始化数据库

1. 登录 Supabase 控制台
2. 进入 SQL Editor
3. 执行 `scripts/init-database.sql` 脚本

### 步骤 5：重启后端服务

```bash
# 停止服务
pm2 stop xingchufang-server

# 启动服务
pm2 start xingchufang-server

# 查看日志
pm2 logs xingchufang-server
```

---

## 🎯 部署后配置

### 1. 配置微信小程序

在微信公众平台配置服务器域名：

```
开发 -> 开发管理 -> 开发设置 -> 服务器域名

request合法域名: https://api.your-domain.com
uploadFile合法域名: https://api.your-domain.com
downloadFile合法域名: https://api.your-domain.com
```

### 2. 设置超级管理员

**方法 1：通过环境变量配置**（推荐）

在 `.env` 文件中设置 `SUPER_ADMIN_OPENID`。

**方法 2：通过数据库直接插入**

```sql
INSERT INTO users (openid, nickname, role, status)
VALUES ('your_wechat_openid', '超级管理员', 'admin', 'active');
```

**如何获取微信 openid？**

1. 先在小程序中使用你的微信登录
2. 登录 Supabase 控制台
3. 查询 `users` 表，找到你的记录
4. 查看 `openid` 字段
5. 更新 `role` 字段为 `admin`

### 3. 测试部署

```bash
# 检查后端服务
curl https://api.your-domain.com/api/welcome

# 检查前端页面
curl https://your-domain.com

# 查看 PM2 进程
pm2 list

# 查看 Nginx 状态
systemctl status nginx
```

---

## 📊 部署架构

```
用户
 ├─ 微信小程序
 │    └─> API 请求
 │
 └─ H5 Web
      └─> HTTPS 请求
             │
     ┌───────▼────────┐
     │   Nginx (443)  │
     │  ┌──────────┐  │
     │  │   H5     │  │
     │  │  静态资源  │  │
     │  └──────────┘  │
     │  ┌──────────┐  │
     │  │ API 代理  │  │
     │  └──────────┘  │
     └───────┬────────┘
             │
     ┌───────▼────────┐
     │  NestJS (3000)  │
     │  ┌──────────┐  │
     │  │ 业务逻辑  │  │
     │  └──────────┘  │
     └────┬───────┬───┘
          │       │
    ┌─────▼──┐ ┌──▼──────────┐
    │Supabase│ │  S3 对象存储  │
    │  数据库 │ │  (文件/图片)  │
    └────────┘ └─────────────┘
```

---

## 🔧 常用运维命令

### 后端服务管理

```bash
# 查看进程
pm2 list

# 查看日志
pm2 logs xingchufang-server

# 重启服务
pm2 restart xingchufang-server

# 停止服务
pm2 stop xingchufang-server

# 删除服务
pm2 delete xingchufang-server

# 查看详细信息
pm2 show xingchufang-server
```

### Nginx 管理

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

### SSL 证书管理

```bash
# 续期证书
certbot renew

# 测试续期
certbot renew --dry-run

# 查看证书信息
certbot certificates
```

### 数据库管理（Supabase）

1. 登录 Supabase 控制台
2. 进入 SQL Editor
3. 执行 SQL 查询

---

## 🐛 常见问题

### 1. 后端服务无法启动

**检查日志**：
```bash
pm2 logs xingchufang-server --lines 100
```

**常见原因**：
- 端口 3000 被占用
- 数据库连接失败
- 环境变量未配置

### 2. Nginx 502 Bad Gateway

**检查后端服务**：
```bash
pm2 list
curl http://localhost:3000/api/welcome
```

**检查 Nginx 配置**：
```bash
nginx -t
systemctl status nginx
```

### 3. SSL 证书配置失败

**确保**：
- 域名已解析到服务器
- 80 端口可访问
- DNS 记录已生效（可能需要等待几分钟）

### 4. 数据库连接失败

**检查**：
- `.env` 文件中的 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY` 是否正确
- Supabase 项目是否已启用
- 网络连接是否正常

---

## 📱 微信小程序发布

### 1. 配置服务器域名

```
开发 -> 开发管理 -> 开发设置 -> 服务器域名

request合法域名: https://api.your-domain.com
uploadFile合法域名: https://api.your-domain.com
downloadFile合法域名: https://api.your-domain.com
```

### 2. 上传代码

使用微信开发者工具上传代码到微信平台。

### 3. 提交审核

```
微信公众平台 -> 版本管理 -> 开发版本 -> 提交审核
```

### 4. 发布

审核通过后，在微信公众平台上发布小程序。

---

## 🔐 安全建议

1. **定期更新系统和依赖**
   ```bash
   apt-get update && apt-get upgrade
   pnpm update
   ```

2. **配置防火墙**
   ```bash
   ufw enable
   ufw status
   ```

3. **定期备份数据库**
   - Supabase 自动备份
   - 或手动导出数据库

4. **监控日志**
   ```bash
   pm2 logs xingchufang-server
   tail -f /var/log/nginx/access.log
   ```

5. **使用强密码和密钥**
   - JWT_SECRET 使用长随机字符串
   - 数据库密码使用强密码

---

## 📞 技术支持

如遇到问题，请检查：

1. 部署脚本日志
2. PM2 进程日志
3. Nginx 日志
4. 后端服务日志

---

## ✅ 部署检查清单

**服务器环境**：
- [ ] Node.js 18+ 已安装
- [ ] pnpm 已安装
- [ ] Nginx 已安装
- [ ] PM2 已安装
- [ ] 防火墙已配置

**代码部署**：
- [ ] 代码已上传到服务器
- [ ] 依赖已安装
- [ ] 后端已构建
- [ ] 前端已构建

**配置**：
- [ ] .env 文件已配置
- [ ] Nginx 已配置
- [ ] SSL 证书已配置

**数据库**：
- [ ] Supabase 项目已创建
- [ ] 数据库表已创建
- [ ] 数据库索引已创建

**服务**：
- [ ] 后端服务已启动
- [ ] Nginx 已启动
- [ ] SSL 证书已生效

**测试**：
- [ ] 后端 API 可访问
- [ ] 前端页面可访问
- [ ] 登录功能正常

**微信小程序**：
- [ ] 服务器域名已配置
- [ ] 代码已上传
- [ ] 已提交审核
