# 微信小程序发布配置指南

## 1. 微信登录配置

### 1.1 配置微信 API 调用

在 `server/src/user/user.service.ts` 中，修改 `wechatLogin` 方法，调用真实的微信 API：

```typescript
async wechatLogin(code: string): Promise<LoginResponse> {
  this.logger.log('收到登录请求，code:', code);

  // 调用微信 API 获取 openid
  const wxResponse = await fetch(
    `https://api.weixin.qq.com/sns/jscode2session?appid=${process.env.TARO_APP_WEAPP_APPID}&secret=${process.env.WECHAT_APP_SECRET}&js_code=${code}&grant_type=authorization_code`
  );

  const wxData = await wxResponse.json();

  if (wxData.errcode) {
    this.logger.error('微信 API 错误:', wxData);
    throw new HttpException('微信登录失败', HttpStatus.UNAUTHORIZED);
  }

  const openid = wxData.openid;
  const unionid = wxData.unionid;

  // 查找或创建用户（后续代码不变）
  // ...
}
```

### 1.2 环境变量配置

确保以下环境变量已配置：
- `TARO_APP_WEAPP_APPID`: 微信小程序 AppID
- `WECHAT_APP_SECRET`: 微信小程序 AppSecret
- `PROJECT_DOMAIN`: 后端域名

### 1.3 服务器域名配置

在微信公众平台配置：
```
开发 -> 开发管理 -> 开发设置 -> 服务器域名
```

配置以下域名：
```
request合法域名: https://api.xingchufang.cn
uploadFile合法域名: https://api.xingchufang.cn
downloadFile合法域名: https://api.xingchufang.cn
```

---

## 2. 用户访问控制方案

### 方案 A：开放注册 + 管理员审核（推荐）

**优点**：
- 用户可以自主注册
- 管理员可以审核用户
- 灵活性高

**实现方式**：
1. 新用户注册时，状态默认为 `pending`（待审核）
2. 管理员在管理后台审核用户
3. 审核通过后，用户才能使用系统功能

**代码修改**：
```typescript
// server/src/user/user.service.ts
const newUser = {
  openid,
  nickname: `用户${Date.now()}`,
  role: 'user',
  status: 'pending', // 改为 pending，需要审核
  created_at: now,
  updated_at: now,
};
```

### 方案 B：邀请码注册（更安全）

**优点**：
- 只有持有邀请码的用户才能注册
- 安全性更高

**实现方式**：
1. 管理员生成邀请码
2. 新用户注册时需要输入邀请码
3. 验证邀请码有效后才允许注册

**代码修改**：
1. 创建 `invite_codes` 表
2. 修改登录接口，增加邀请码验证
3. 管理后台增加邀请码管理功能

### 方案 C：完全开放（不推荐）

**优点**：
- 用户可以自由使用

**缺点**：
- 陌生人可以随意使用
- 无法控制用户质量

---

## 3. 初始管理员账号

### 3.1 创建初始管理员账号

**方法 1：通过 SQL 直接插入**

```sql
INSERT INTO users (
  openid,
  nickname,
  role,
  status,
  created_at,
  updated_at
) VALUES (
  'INITIAL_ADMIN_OPENID',  -- 替换为你的微信 openid
  '超级管理员',
  'admin',
  'active',
  NOW(),
  NOW()
);
```

**方法 2：通过数据库管理工具**

1. 登录 Supabase 控制台
2. 进入表编辑器（Table Editor）
3. 选择 `users` 表
4. 点击"插入新记录"（Insert New Record）
5. 填写以下字段：
   - `openid`: 你的微信 openid（先注册后查看）
   - `nickname`: 超级管理员
   - `role`: admin
   - `status`: active

### 3.2 如何获取你的微信 openid？

**步骤**：
1. 先在小程序中注册（使用你的微信）
2. 登录 Supabase 控制台
3. 查询 `users` 表
4. 找到你的记录，查看 `openid` 字段
5. 将 `role` 字段修改为 `admin`

---

## 4. 管理后台入口

### 4.1 管理后台页面

当前系统已实现以下管理页面：

| 页面 | 路径 | 功能 |
|------|------|------|
| 管理后台首页 | `/pages/admin/dashboard/index` | 数据统计、全局监控 |
| 用户管理 | `/pages/admin/users/index` | 用户列表、角色管理、状态管理 |
| 数据查看 | `/pages/admin/user-data/index` | 查看用户的所有数据 |
| 语料库管理 | `/pages/admin/lexicon-manage/index` | 管理语料库 |
| 快捷笔记管理 | `/pages/admin/quick-note-manage/index` | 管理快捷笔记 |
| 智能报告 | `/pages/admin/ai-report/index` | 生成智能运营报告 |
| 审计日志 | `/pages/admin/audit/index` | 查看操作日志 |
| 数据导出 | `/pages/admin/data-export/index` | 导出数据 |
| 共享管理 | `/pages/admin/share-manage/index` | 管理语料库共享 |
| 共享统计 | `/pages/admin/share-stats/index` | 查看共享统计 |

### 4.2 如何访问管理后台？

**方法 1：在小程序中访问**

1. 使用管理员账号登录小程序
2. 进入"系统"页面
3. 点击"管理后台"入口

**方法 2：直接通过 URL 访问（需要添加导航按钮）**

在小程序的首页或个人中心添加管理后台入口：

```typescript
<View onClick={() => Taro.navigateTo({ url: '/pages/admin/dashboard/index' })}>
  <Text>管理后台</Text>
</View>
```

### 4.3 权限控制

管理后台已有权限控制：
- **普通用户**：无法访问管理后台
- **管理员**：可以访问所有管理功能

权限控制由后端 `AdminGuard` 实现：
```typescript
// server/src/guards/admin.guard.ts
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || user.role !== 'admin') {
      throw new UnauthorizedException('需要管理员权限');
    }

    return true;
  }
}
```

---

## 5. 推荐配置方案

### 阶段 1：初始发布（开放注册）

1. 保持当前代码不变
2. 配置微信 API 调用（修改 `wechatLogin`）
3. 配置服务器域名
4. 先让用户可以自由注册和使用
5. 你可以通过管理后台监控用户行为

### 阶段 2：增加访问控制

如果发现陌生人使用：
1. 在管理后台禁用陌生用户
2. 或者选择方案 A（需要审核）或方案 B（邀请码）

### 阶段 3：设置管理员

1. 用你的微信注册账号
2. 在数据库中将该用户的 `role` 改为 `admin`
3. 重新登录，即可访问管理后台

---

## 6. 注意事项

### 安全提醒

1. **不要泄露 AppSecret**：微信 AppSecret 非常敏感，不要在前端代码中使用
2. **服务器域名白名单**：必须在微信公众平台配置合法域名，否则无法请求后端 API
3. **HTTPS 必需**：微信小程序要求所有请求必须是 HTTPS

### 隐私合规

1. **用户协议**：小程序必须提供用户协议和隐私政策
2. **数据收集备案**：在微信公众平台配置收集用户信息的备案
3. **隐私保护指引**：在小程序设置中配置隐私保护指引

---

## 7. 快速检查清单

发布前检查：
- [ ] 配置微信 API 调用（修改 `wechatLogin`）
- [ ] 配置服务器域名（request、uploadFile、downloadFile）
- [ ] 环境变量正确配置（APPID、AppSecret、PROJECT_DOMAIN）
- [ ] 创建初始管理员账号
- [ ] 上传用户协议和隐私政策
- [ ] 配置隐私保护指引
- [ ] 测试登录功能
- [ ] 测试管理后台访问

---

**总结**：
1. 开发环境的微信登录在生产环境可以用，但需要配置微信 API
2. 推荐先开放注册，后期根据需要增加访问控制
3. 需要你用自己的微信注册，然后在数据库中设置为管理员
4. 管理后台入口在小程序的"系统"页面或直接通过 URL 访问
