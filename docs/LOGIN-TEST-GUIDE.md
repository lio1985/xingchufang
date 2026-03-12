# H5 环境登录测试指南

## ✅ 问题已修复

**问题**：H5 环境点击「微信一键登录」失败，提示 `login:fail 暂时不支持 API`

**原因**：`Taro.login()` API 只支持微信小程序环境，不支持 H5 环境

**解决方案**：添加了 H5 环境的模拟登录降级逻辑

---

## 🧪 现在可以测试登录了

### 步骤 1：刷新页面

由于代码已经修改，需要等待热更新完成：

1. **在浏览器中按 F5 刷新页面**
2. 或者按 `Ctrl + Shift + R` 强制刷新

### 步骤 2：点击登录

1. 点击「微信一键登录」按钮
2. 应该会看到提示：「H5 环境模拟登录」
3. 然后自动跳转到首页

---

## 🎯 登录后的表现

### 情况 1：新用户（pending 状态）

你会看到：
- 弹窗提示：「等待管理员审核」
- 跳转到首页
- 首页显示等待审核的提示卡片
- 四个功能卡片被禁用（显示"等待审核"提示）

这是正常的，因为新用户默认状态是 `pending`，需要管理员审核。

---

### 情况 2：超级管理员（已配置 SUPER_ADMIN_OPENID）

如果你已经在 `.env.local` 中配置了 `SUPER_ADMIN_OPENID`，并且匹配当前登录的 openid：

你会看到：
- 提示：「登录成功」
- 跳转到首页
- 首页右上角显示「管理后台」入口
- 可以正常使用所有功能

---

### 情况 3：普通用户（active 状态，已审核通过）

你会看到：
- 提示：「登录成功」
- 跳转到首页
- 可以正常使用所有功能
- 没有「管理后台」入口

---

## 🔍 如何获取你的 OpenID

### 方法 1：查看浏览器控制台

1. 按 `F12` 打开开发者工具
2. 切换到 `Console` 标签
3. 点击登录后，会看到类似日志：
   ```
   H5 环境模拟登录 code: mock_code_1234567890
   ```
4. 后端会生成 openid：`mock_openid_mock_code_1234567890`

### 方法 2：查看后端日志

在 Coze 终端运行：
```bash
tail -f /tmp/coze-logs/dev.log
```

登录时会看到：
```
[UserService] 收到登录请求，code: mock_code_1234567890
[UserService] 用户登录成功: openid=mock_openid_mock_code_1234567890
```

### 方法 3：查询数据库

```bash
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

## 🚀 配置超级管理员

### 步骤 1：获取你的 openid

按照上面的方法获取你的 openid，例如：
```
mock_openid_mock_code_1234567890
```

### 步骤 2：编辑环境变量

编辑 `.env.local` 文件：
```bash
SUPER_ADMIN_OPENID=mock_openid_mock_code_1234567890
```

### 步骤 3：重启服务

在 Coze 终端运行：
```bash
cd /workspace/projects && coze dev
```

### 步骤 4：重新登录

1. 刷新浏览器页面
2. 点击「微信一键登录」
3. 应该会自动获得管理员权限

---

## ✅ 验证管理员权限

登录后，检查以下几点：

- ✅ 首页右上角显示「管理后台」入口
- ✅ 点击「管理后台」能正常进入
- ✅ 用户管理中能看到自己的角色是 admin
- ✅ 用户状态是 active

---

## 📝 注意事项

### H5 环境 vs 小程序环境

**H5 环境（当前）**：
- 使用模拟登录
- openid 格式：`mock_openid_mock_code_xxxxx`
- 需要手动配置 `SUPER_ADMIN_OPENID`

**小程序环境（生产）**：
- 使用真实的微信登录
- openid 格式：微信真实的 openid
- 同样可以配置 `SUPER_ADMIN_OPENID`

### 多次登录

- 每次登录可能会生成新的 openid（因为 code 包含时间戳）
- 配置 `SUPER_ADMIN_OPENID` 时，使用你最近一次登录的 openid

### 重新配置管理员

如果登录后发现 openid 变了，只需：
1. 获取新的 openid
2. 更新 `.env.local` 中的 `SUPER_ADMIN_OPENID`
3. 重启服务
4. 重新登录

---

## 🆘 常见问题

### Q1: 登录后还是显示「等待审核」？

**A**: 检查以下几点：
1. 确认 `.env.local` 中的 `SUPER_ADMIN_OPENID` 是否正确
2. 确认服务已重启：`cd /workspace/projects && coze dev`
3. 重新登录，确保使用的是新的 openid

### Q2: 如何查看我的 openid？

**A**:
- 方法1：查看浏览器控制台（F12 → Console）
- 方法2：查看后端日志：`tail -f /tmp/coze-logs/dev.log`
- 方法3：查询数据库（见上文）

### Q3: 配置了超级管理员但没有效果？

**A**:
1. 确认 openid 格式正确（包括 `mock_openid_` 前缀）
2. 确认没有多余的空格或引号
3. 重启服务
4. 重新登录

---

## 🎯 下一步

登录成功后：

1. **如果是新用户（pending 状态）**：
   - 等待管理员审核
   - 或者配置超级管理员

2. **如果是超级管理员**：
   - 可以进入管理后台
   - 审核其他用户
   - 查看数据统计

3. **如果是普通用户（active 状态）**：
   - 可以正常使用所有功能
   - 创建对话、上传文件等

---

现在就去测试登录吧！刷新页面后点击「微信一键登录」。🚀
