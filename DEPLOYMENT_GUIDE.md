# 部署指南 - 将开发环境更新同步到生产环境

## 📋 最近更新内容

### 功能更新
1. ✅ 用户管理功能增强
   - 管理员登录（账号密码）
   - 用户列表展示（分页、搜索、筛选）
   - 用户删除功能（软删除，标记为 deleted）
   - 用户详情查看

2. ✅ 按钮点击兼容性修复
   - 修复所有图标按钮的跨端点击问题（onTap → onClick）
   - 支持微信小程序和 H5 双端

3. ✅ 全网热点功能优化
   - 支持分页加载（最多显示 50 条）
   - 优化加载性能

4. ✅ 数据清理
   - 清理 30 个历史用户数据
   - 保留 admin（管理员）和 test2026（测试用户）

---

## 🚀 部署流程

### 第一步：代码部署

#### 1.1 确保代码已提交
```bash
# 查看最新提交
git log --oneline -5

# 确认最新提交是：
# b57e856 docs: 清理历史用户数据，将30个非今天用户标记为deleted状态
```

#### 1.2 推送到远程仓库
```bash
# 推送到远程仓库（如果还未推送）
git push origin main
```

#### 1.3 构建生产版本
```bash
# 构建小程序版本
pnpm build:weapp

# 构建后端版本
pnpm build:server
```

#### 1.4 部署到服务器
根据你的部署方式选择：

**方式 A：手动部署**
```bash
# 将构建产物上传到服务器
# - 小程序端：dist/ 目录
# - 后端端：dist/server/ 目录
```

**方式 B：使用 CI/CD（推荐）**
- 如果配置了 GitHub Actions 或其他 CI/CD 工具，会自动部署

---

### 第二步：数据库同步

#### 2.1 检查数据库 Schema 变更

当前 `users` 表结构已包含：
- ✅ `employee_id` (text, 可选) - 员工ID
- ✅ `role` (text, 默认 'user') - 用户角色
- ✅ `status` (text, 默认 'active') - 用户状态
- ✅ `password` (text, 可选) - 密码

**如果生产环境缺少这些字段，执行以下 SQL：**

```sql
-- 添加 employee_id 字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS employee_id text;

-- 添加 role 字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user';

-- 添加 status 字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';

-- 添加 password 字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS password text;
```

#### 2.2 同步用户清理操作

**在生产环境执行用户清理**（将非今天的用户标记为 deleted）：

```sql
-- 方式 A：通过 Supabase SQL Editor 执行
-- 登录 Supabase 管理后台 → SQL Editor → 执行以下语句

UPDATE users
SET status = 'deleted',
    updated_at = NOW()
WHERE DATE(created_at) < CURRENT_DATE
  AND status != 'deleted';

-- 验证结果
SELECT 
  COUNT(*) FILTER (WHERE status = 'deleted') as deleted_count,
  COUNT(*) FILTER (WHERE status = 'active') as active_count
FROM users;
```

**方式 B：使用脚本执行**（如果你有生产环境数据库连接信息）

```bash
# 替换为你的生产环境数据库信息
export PROD_SUPABASE_URL="https://your-project.supabase.co"
export PROD_SUPABASE_KEY="your-anon-key"

# 执行清理脚本
node scripts/cleanup-users.js
```

---

### 第三步：小程序发布

#### 3.1 上传小程序代码

**使用微信开发者工具**：
1. 打开微信开发者工具
2. 导入项目（指向构建后的 `dist/` 目录）
3. 点击「上传」按钮
4. 填写版本号和更新日志

**更新日志示例**：
```
版本更新内容：
1. 新增用户管理功能，支持管理员登录和用户管理
2. 优化全网热点分页加载，提升性能
3. 修复按钮点击兼容性问题，支持小程序和 H5
4. 优化用户数据管理
```

#### 3.2 提交审核
1. 登录微信公众平台（mp.weixin.qq.com）
2. 进入「版本管理」→「开发版本」
3. 点击「提交审核」
4. 填写审核信息
5. 等待微信审核（通常 1-3 个工作日）

#### 3.3 发布上线
- 审核通过后，点击「发布」按钮即可上线
- 或配置「灰度发布」，先向部分用户开放

---

## ⚠️ 重要注意事项

### 数据安全
1. **生产环境操作前备份**：
   - 建议先备份生产环境数据库
   - 在 Supabase 后台执行备份操作

2. **用户清理确认**：
   - 确认生产环境中是否有不能删除的重要用户
   - 建议先在测试环境验证 SQL 语句

### 版本管理
1. **语义化版本号**：
   - 大版本：v1.0.0（重大功能变更）
   - 小版本：v1.1.0（新增功能）
   - 修复版本：v1.1.1（bug 修复）

2. **回滚方案**：
   - 保留上一个版本的代码
   - 如果出现问题，可以快速回滚

### 测试建议
1. **功能测试**：
   - 测试用户管理功能（登录、查看、删除）
   - 测试全网热点分页加载
   - 测试所有按钮点击功能

2. **兼容性测试**：
   - 微信小程序端测试
   - H5 端测试
   - 不同设备测试（iOS/Android）

---

## 🔍 部署验证清单

### 代码部署验证
- [ ] 生产环境代码已更新
- [ ] 后端服务正常运行
- [ ] 前端页面正常访问

### 数据库验证
- [ ] Schema 变更已应用
- [ ] 用户数据已清理（非今天用户标记为 deleted）
- [ ] 管理员账号可以正常登录

### 功能验证
- [ ] 用户管理页面正常显示
- [ ] 搜索和筛选功能正常
- [ ] 删除功能正常
- [ ] 按钮点击功能正常
- [ ] 热点分页加载正常

---

## 📞 遇到问题？

如果部署过程中遇到问题，请检查：

1. **后端服务**：查看日志 `/tmp/coze-logs/dev.log`
2. **前端控制台**：查看浏览器控制台日志
3. **数据库连接**：确认 Supabase 连接信息正确
4. **网络请求**：检查 API 请求是否成功

---

## 📅 下一步

部署完成后，可以继续开发：
1. 添加更多用户管理功能（编辑、批量操作）
2. 优化用户权限管理
3. 添加数据统计功能
4. 完善其他业务功能

如有任何问题，随时联系我！
