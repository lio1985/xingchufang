# 超级管理员配置和验证指南

## 🎉 后端服务已成功启动

**服务状态**：
- ✅ 前端服务：http://localhost:5000
- ✅ 后端服务：http://localhost:3000
- ✅ 数据库：Supabase（已配置）
- ✅ 环境变量：已动态注入

---

## 📋 下一步操作

### 步骤 1：登录微信小程序

1. 在浏览器中打开：http://localhost:5000
2. 点击页面上的「微信登录」按钮
3. 授权登录后，系统会自动创建用户记录

---

### 步骤 2：获取你的 OpenID

**开发环境**：
- 在开发环境（H5 模式），系统会自动生成模拟的 openid
- 你可以通过查看后端日志或数据库来获取当前用户的 openid

**生产环境**：
- 在生产环境（微信小程序），系统会调用微信 API 获取真实的 openid
- 需要在微信公众平台配置服务器域名

---

### 步骤 3：配置超级管理员

**方法 1：修改环境变量（推荐）**

1. 编辑 `.env.local` 文件：
   ```bash
   # 将 YOUR_OPENID 替换为你登录后获取的 openid
   SUPER_ADMIN_OPENID=YOUR_OPENID
   ```

2. 重启后端服务：
   ```bash
   cd /workspace/projects && coze dev
   ```

3. 重新登录微信小程序，系统会自动识别你是超级管理员

**方法 2：直接使用开发环境模拟值**

开发环境默认生成的 openid 格式为：`mock_openid_${随机字符串}`

你可以直接使用这个值配置：
```bash
SUPER_ADMIN_OPENID=mock_openid_xxxxx
```

---

### 步骤 4：验证管理员权限

**验证方法 1：查看首页管理员入口**

1. 登录微信小程序后，查看首页右上角
2. 如果看到「管理后台」入口，说明管理员权限已生效
3. 如果看到待审核用户徽标（红色数字），点击可跳转到审核列表

**验证方法 2：访问管理后台**

1. 首页点击「管理后台」入口
2. 应该能够正常进入管理后台首页
3. 查看用户列表、数据统计等功能

**验证方法 3：查看用户角色**

1. 进入管理后台 → 用户管理
2. 找到自己的用户记录
3. 确认角色字段为 `admin`，状态字段为 `active`

---

## 🔍 如何获取当前用户的 OpenID

### 方法 1：查看浏览器控制台

1. 登录后，打开浏览器开发者工具（F12）
2. 查看 Console 控制台
3. 找到登录相关的日志输出，应该会显示 openid

### 方法 2：查看后端日志

```bash
# 查看后端日志
tail -f /tmp/coze-logs/dev.log

# 登录时会输出类似信息：
# [UserService] 用户登录成功: openid=mock_openid_xxxxx
```

### 方法 3：查询数据库

```bash
# 使用 supabase 客户端查询
cd /workspace/projects
node -e "
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function main() {
  const { data, error } = await supabase
    .from('users')
    .select('id, openid, role, status, created_at')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('查询失败:', error);
  } else {
    console.log('最新用户信息:');
    console.log(JSON.stringify(data[0], null, 2));
  }
}

main();
"
```

---

## ✅ 验证成功标志

当以下条件都满足时，说明超级管理员配置成功：

- ✅ 后端服务正常运行
- ✅ 能够登录微信小程序
- ✅ 首页显示「管理后台」入口
- ✅ 能够正常进入管理后台
- ✅ 用户角色为 admin
- ✅ 用户状态为 active

---

## 🚨 常见问题

### Q1: 登录后看不到「管理后台」入口？

**原因**：
- 可能 openid 不匹配
- 可能配置的环境变量未生效

**解决方法**：
1. 检查 `.env.local` 文件中的 `SUPER_ADMIN_OPENID` 值
2. 确认 openid 格式正确（没有多余的空格或引号）
3. 重启后端服务
4. 重新登录

### Q2: 登录时提示「网络错误，请重试」？

**原因**：
- 后端服务未正常启动

**解决方法**：
1. 检查后端服务状态：
   ```bash
   curl -I http://localhost:3000/api/hello
   ```
2. 如果服务未运行，重启服务：
   ```bash
   cd /workspace/projects && coze dev
   ```

### Q3: 如何重置超级管理员？

**方法 1**：修改 `.env.local` 文件，将 `SUPER_ADMIN_OPENID` 改为其他用户的 openid

**方法 2**：手动修改数据库中的用户角色：
```bash
node server/scripts/setup-admin.js <target_openid>
```

---

## 📝 超级管理员功能

超级管理员拥有以下权限：

1. **用户管理**：
   - 查看所有用户
   - 审核新用户
   - 修改用户角色
   - 禁用/删除用户

2. **数据查看**：
   - 查看所有对话记录
   - 查看所有语料库
   - 查看所有文件
   - 查看所有任务

3. **数据导出**：
   - 导出用户数据
   - 导出对话记录
   - 导出语料库

4. **统计报表**：
   - 用户统计
   - 全局统计
   - 共享统计
   - 智能运营报告生成

---

## 🎯 下一步

配置成功后，你可以：

1. **测试管理员功能**：
   - 进入管理后台
   - 查看用户列表
   - 查看数据统计

2. **测试审核功能**：
   - 用另一个账号注册新用户
   - 使用管理员账号审核新用户

3. **测试数据导出**：
   - 导出用户数据
   - 导出对话记录

4. **准备正式部署**：
   - 阅读 `docs/WECHAT-MINI-PROGRAM-RELEASE-GUIDE.md`
   - 配置微信小程序
   - 配置服务器域名
