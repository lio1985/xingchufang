# 管理员设置指南

## 快速设置管理员的步骤

### 步骤 1: 用你的微信注册小程序

1. 在小程序中点击"微信一键登录"
2. 使用你的微信账号登录
3. 登录成功后，你的账号已在数据库中创建

### 步骤 2: 获取你的 OpenID

在项目根目录运行：

```bash
node server/scripts/get-user-list.js
```

**示例输出**：
```
🔍 获取用户列表...

✅ 共找到 2 个用户

────────────────────────────────────────────────────────────────────────────────

1. 用户abc123
   OpenID: o6_bmasdasdsad6_2sgVt7hMZOPfL
   角色: user
   状态: active
   注册时间: 2026-03-05 21:30:00
   最后登录: 2026-03-05 21:30:00

────────────────────────────────────────────────────────────────────────────────

2. 用户def456
   OpenID: o6_bmasdasdsad6_2sgVt7hMZOPfM
   角色: user
   状态: active
   注册时间: 2026-03-05 21:35:00
   最后登录: 2026-03-05 21:35:00

────────────────────────────────────────────────────────────────────────────────

💡 如何设置管理员:
   找到你的 openid，然后运行:
   node server/scripts/setup-admin.js <你的openid>
```

**找到你的 OpenID**：根据昵称和登录时间，找到你的 openid。

### 步骤 3: 设置为管理员

在项目根目录运行：

```bash
node server/scripts/setup-admin.js <你的openid>
```

**示例**：
```bash
node server/scripts/setup-admin.js o6_bmasdasdsad6_2sgVt7hMZOPfL
```

**示例输出**：
```
🔍 查找用户: o6_bmasdasdsad6_2sgVt7hMZOPfL
✅ 找到用户:
   ID: 123e4567-e89b-12d3-a456-426614174000
   昵称: 用户abc123
   当前角色: user
   当前状态: active

🔧 设置为管理员...

✅ 成功！该用户已设置为管理员

📋 用户信息:
   ID: 123e4567-e89b-12d3-a456-426614174000
   昵称: 用户abc123
   角色: admin
   状态: active

🎉 现在你可以使用管理后台了！
```

### 步骤 4: 重新登录小程序

1. 退出小程序
2. 重新登录
3. 现在你可以访问管理后台了

---

## 访问管理后台

### 方法 1: 通过小程序菜单访问

1. 登录小程序
2. 点击底部"系统"标签
3. 找到"管理后台"入口（如果有）
4. 点击进入

### 方法 2: 手动输入 URL

在小程序中可以通过以下 URL 访问管理页面：

- 管理后台首页: `/pages/admin/dashboard/index`
- 用户管理: `/pages/admin/users/index`
- 数据查看: `/pages/admin/user-data/index`
- 语料库管理: `/pages/admin/lexicon-manage/index`
- 快捷笔记管理: `/pages/admin/quick-note-manage/index`
- AI报告: `/pages/admin/ai-report/index`
- 审计日志: `/pages/admin/audit/index`
- 数据导出: `/pages/admin/data-export/index`
- 共享管理: `/pages/admin/share-manage/index`
- 共享统计: `/pages/admin/share-stats/index`

---

## 管理后台功能

### 数据监控
- 全局统计（用户数、对话数、消息数、文件数等）
- 活跃用户排行
- 智能运营报告生成

### 用户管理
- 查看所有用户
- 设置用户角色（admin/user）
- 禁用/启用用户
- 查看用户详细数据

### 语料库管理
- 管理所有语料库
- 设置全局共享
- 查看共享统计

### 数据导出
- 导出用户数据
- 导出语料库数据
- 导出对话数据

### 审计日志
- 查看所有用户操作
- 按时间、类型筛选
- 查看详细操作记录

---

## 常见问题

### Q1: 如何撤销管理员权限？

使用 Supabase 控制台：
1. 登录 Supabase 控制台
2. 进入表编辑器
3. 选择 `users` 表
4. 找到该用户
5. 将 `role` 字段改为 `user`

### Q2: 如何禁用某个用户？

有两种方法：

**方法 1: 使用管理后台**
1. 登录管理后台
2. 进入"用户管理"页面
3. 找到该用户
4. 点击"禁用"

**方法 2: 使用 Supabase 控制台**
1. 登录 Supabase 控制台
2. 进入表编辑器
3. 选择 `users` 表
4. 找到该用户
5. 将 `status` 字段改为 `disabled`

### Q3: 如何防止陌生人使用？

推荐以下方案：

**方案 A: 开放注册 + 管理员审核**
1. 修改 `server/src/user/user.service.ts` 中的 `status: 'active'` 为 `status: 'pending'`
2. 新用户注册后状态为 `pending`
3. 管理员在管理后台审核通过后，状态改为 `active`

**方案 B: 邀请码注册**
1. 需要添加邀请码功能（需要额外开发）
2. 用户注册时需要输入邀请码
3. 验证邀请码有效后才允许注册

**方案 C: 手动管理**
1. 保持开放注册
2. 定期查看用户列表
3. 发现陌生用户时，在管理后台禁用

### Q4: 忘记哪个 openid 是我的怎么办？

运行 `get-user-list.js` 脚本：
```bash
node server/scripts/get-user-list.js
```

根据以下信息找到你的账号：
- 注册时间
- 最后登录时间
- 昵称

如果你刚刚登录，你的账号应该在列表最上面。

### Q5: 脚本运行失败怎么办？

**问题 1: 找不到环境变量**
```
❌ 错误: 缺少 Supabase 环境变量
```

**解决方法**：
确保已配置 `.env` 文件，包含：
```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
```

**问题 2: 未找到用户**
```
❌ 未找到该 openid 对应的用户
```

**解决方法**：
1. 确认 openid 正确（不要有空格）
2. 确认已用微信登录小程序
3. 运行 `get-user-list.js` 查看所有用户

---

## 注意事项

1. **管理员权限**: 管理员可以查看所有用户数据，请谨慎分配
2. **安全性**: 不要泄露 AppSecret 和数据库密钥
3. **备份**: 建议定期备份数据库
4. **监控**: 定期查看审计日志，发现异常操作及时处理
