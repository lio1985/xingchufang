# 星厨房预设账号设置指南

## 账号信息

### 管理员账号
- **用户名**: `admin`
- **密码**: `Admin@2025!Secure`
- **角色**: admin
- **状态**: active

### 测试账号
- **用户名**: `test2026`
- **密码**: `test123456`
- **角色**: user
- **状态**: active

---

## 方法一：直接在 Supabase 执行 SQL（推荐）

这是最快捷的方法，无需重新部署后端代码。

### 步骤：

1. **登录 Supabase 控制台**
   - 打开 Supabase 项目控制台
   - 进入 SQL Editor

2. **执行 SQL 脚本**
   - 打开 `init-default-accounts.sql` 文件
   - 复制全部内容
   - 在 Supabase SQL Editor 中粘贴并执行

3. **验证账号创建**
   - 执行脚本中的验证查询，确认两个账号都已创建

4. **测试登录**
   - 访问登录页面
   - 使用 admin/Admin@2025!Secure 登录
   - 或使用 test2026/test123456 登录

---

## 方法二：部署新版本后端代码

如果你希望使用 API 接口来管理预设账号，可以部署新版本的后端代码。

### 步骤：

1. **将构建包上传到服务器**
   ```bash
   # 在本地执行
   scp server-dist.tar.gz root@14.103.111.91:/opt/xingchufang/
   ```

2. **在服务器上解压并部署**
   ```bash
   # 登录服务器
   ssh root@14.103.111.91
   
   # 进入项目目录
   cd /opt/xingchufang/
   
   # 备份现有代码
   mv dist dist-backup-$(date +%Y%m%d)
   
   # 解压新代码
   tar xzvf server-dist.tar.gz
   
   # 重启服务
   pm2 restart xingchufang-api
   # 或使用你的服务管理命令
   ```

3. **调用初始化接口创建账号**
   ```bash
   curl -X POST https://api.xingchufang.cn/api/user/init-default-accounts \
     -H "Content-Type: application/json"
   ```

---

## 方法三：使用后端代码中的自动创建功能

后端代码已经实现了 `loginWithPassword` 方法的自动创建预设账号功能。当你使用 admin/Admin@2025!Secure 或 test2026/test123456 登录时，如果账号不存在，系统会自动创建。

**注意**：此方法需要部署最新的后端代码。

---

## 验证账号

### 测试登录 API

```bash
# 测试管理员账号
curl -X POST "https://api.xingchufang.cn/api/user/login-with-password" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@2025!Secure"}'

# 测试测试账号
curl -X POST "https://api.xingchufang.cn/api/user/login-with-password" \
  -H "Content-Type: application/json" \
  -d '{"username":"test2026","password":"test123456"}'
```

成功响应示例：
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "...",
      "nickname": "admin",
      "role": "admin",
      "status": "active"
    }
  }
}
```

---

## 注意事项

1. **密码安全**：生产环境请修改默认密码
2. **员工ID**：SQL 脚本中使用的 employee_id 是随机生成的，如果与现有账号冲突，请修改脚本中的值
3. **重复执行**：SQL 脚本会先删除已存在的同名账号再重新创建，确保账号信息更新

---

## 文件清单

- `init-default-accounts.sql` - Supabase SQL 初始化脚本
- `server-dist.tar.gz` - 后端构建包（如需部署新版本）
