# Docker 安装命令 - 在服务器上执行

# 方法1: 使用阿里云镜像（推荐）
curl -fsSL https://get.docker.com | bash -s docker --mirror Aliyun

# 如果上面失败，使用方法2: 手动安装
# 添加 Docker 官方 GPG 密钥（使用清华镜像）
curl -fsSL https://mirrors.tuna.tsinghua.edu.cn/docker-ce/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# 添加 Docker 软件源
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://mirrors.tuna.tsinghua.edu.cn/docker-ce/linux/debian $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# 更新并安装
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 启动 Docker
systemctl enable docker
systemctl start docker

# 验证安装
docker --version
docker compose version

# 安装 docker-compose（如果上面没有安装）
curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
docker-compose --version
