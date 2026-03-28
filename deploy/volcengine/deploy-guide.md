# 火山引擎部署指南

## 一、准备工作

### 1. 购买云服务器 ECS
- 推荐配置：2核4G 或以上
- 操作系统：Ubuntu 22.04 LTS 或 CentOS 8
- 地域：选择离用户最近的区域

### 2. 域名准备
- 在火山引擎购买域名或使用已有域名
- 完成域名备案（中国大陆服务器必须）
- 配置 DNS 解析指向服务器 IP

### 3. 开放端口
在火山引擎控制台的安全组中开放：
- 22 (SSH)
- 80 (HTTP)
- 443 (HTTPS)
- 3000 (后端 API，可选，建议通过 Nginx 代理)
- 5000 (前端 Web，可选，建议通过 Nginx 代理)

---

## 二、服务器环境配置

### 1. SSH 登录服务器
```bash
ssh root@your-server-ip
```

### 2. 安装 Docker
```bash
# Ubuntu
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

# 安装 Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

### 3. 创建应用目录
```bash
mkdir -p /opt/star-kitchen
cd /opt/star-kitchen
```

---

## 三、上传代码和配置

### 方式一：使用 Git（推荐）
```bash
git clone https://your-repo-url.git .
```

### 方式二：手动上传
```bash
# 本地执行，打包项目
tar -czvf star-kitchen.tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='dist' \
  --exclude='dist-web' \
  --exclude='logs' \
  .

# 上传到服务器
scp star-kitchen.tar.gz root@your-server-ip:/opt/star-kitchen/

# 服务器解压
cd /opt/star-kitchen
tar -xzvf star-kitchen.tar.gz
```

---

## 四、配置环境变量

### 1. 复制环境变量模板
```bash
cp server/.env.production.example server/.env
```

### 2. 编辑配置文件
```bash
vim server/.env
```

### 3. 必填配置项
```env
# 数据库配置（从 Supabase Dashboard 获取）
COZE_SUPABASE_URL=https://xxxxxx.supabase.co
COZE_SUPABASE_ANON_KEY=eyJhbGciOi...
COZE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# JWT 密钥（生成一个随机字符串）
JWT_SECRET=your-super-secret-key-at-least-32-chars
JWT_EXPIRES_IN=7d

# 微信小程序配置
TARO_APP_WEAPP_APPID=wx你的AppID
WECHAT_APP_SECRET=你的AppSecret

# 生产环境域名
PROJECT_DOMAIN=https://api.yourdomain.com

# 对象存储配置（如果使用）
COZE_BUCKET_ENDPOINT_URL=https://your-bucket.oss-cn-beijing.aliyuncs.com
COZE_BUCKET_NAME=your-bucket-name
```

---

## 五、配置 HTTPS（推荐）

### 1. 安装 Certbot
```bash
# Ubuntu
apt update
apt install -y certbot

# 或使用 Docker
docker run -it --rm -v /etc/letsencrypt:/etc/letsencrypt certbot/certbot certonly --standalone -d api.yourdomain.com
```

### 2. 申请 SSL 证书
```bash
certbot certonly --standalone -d api.yourdomain.com -d yourdomain.com
```

### 3. 创建 Nginx 配置
```bash
mkdir -p nginx
cat > nginx/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # API 域名
    upstream backend {
        server app:3000;
    }

    # Web 域名
    upstream frontend {
        server app:5000;
    }

    # API 服务
    server {
        listen 80;
        listen 443 ssl;
        server_name api.yourdomain.com;

        ssl_certificate /etc/nginx/ssl/api.yourdomain.com/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/api.yourdomain.com/privkey.pem;

        location / {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }

    # 前端服务
    server {
        listen 80;
        listen 443 ssl;
        server_name yourdomain.com www.yourdomain.com;

        ssl_certificate /etc/nginx/ssl/yourdomain.com/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/yourdomain.com/privkey.pem;

        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
EOF
```

---

## 六、启动应用

### 1. 构建并启动
```bash
cd /opt/star-kitchen
docker-compose up -d --build
```

### 2. 查看日志
```bash
docker-compose logs -f app
```

### 3. 检查状态
```bash
docker-compose ps
```

---

## 七、验证部署

### 1. 检查健康状态
```bash
curl http://localhost:3000/api/health
```

### 2. 访问前端
浏览器打开：https://yourdomain.com

### 3. 测试 API
```bash
curl https://api.yourdomain.com/api/hello
```

---

## 八、运维命令

### 重启服务
```bash
docker-compose restart
```

### 更新代码
```bash
git pull
docker-compose up -d --build
```

### 查看日志
```bash
docker-compose logs -f --tail=100 app
```

### 备份数据
```bash
tar -czvf backup-$(date +%Y%m%d).tar.gz logs uploads
```

---

## 九、常见问题

### 1. 端口被占用
```bash
lsof -i :3000
lsof -i :5000
```

### 2. Docker 权限问题
```bash
chmod 666 /var/run/docker.sock
```

### 3. 内存不足
```bash
# 创建交换分区
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

### 4. 防火墙问题
```bash
# Ubuntu UFW
ufw allow 80
ufw allow 443
ufw allow 22

# CentOS Firewalld
firewall-cmd --permanent --add-port=80/tcp
firewall-cmd --permanent --add-port=443/tcp
firewall-cmd --reload
```
