# 企业多用户版本实施方案

## 一、项目背景与目标

### 1.1 背景
当前小程序为个人单用户版本，需要升级为企业多用户协作版本，支持公司内部多人使用，实现数据隔离和管理监督功能。

### 1.2 目标
- 支持多人独立使用，实现数据完全隔离
- 管理员可查看所有用户的使用情况
- 管理员可监督用户上传的数据资料
- 实现细粒度的权限控制和管理功能

---

## 二、现有系统分析

### 2.1 用户体系现状
- **登录方式**：微信一键登录（Taro.login 获取 code）
- **用户表**：users（id, openid, nickname, avatarUrl, createdAt, updatedAt）
- **Token 验证**：base64 编码的 openid + 时间戳
- **缺失功能**：
  - 无角色管理（普通用户/管理员）
  - 无用户状态管理（激活/禁用）
  - 无用户档案信息（真实姓名、部门、职位等）

### 2.2 数据表现状

#### 已有 user_id 的表
- **multimedia_resources**：多媒体资源
- **scheduled_tasks**：定时任务
- **work_plans**：工作计划
- **conversations**：对话记录（userId）
- **viral_favorites**：爆款收藏（userId）

#### 需要添加 user_id 的表
- **lexicons**：语料库（需要添加）
- **work_plan_tasks**：工作计划任务（继承自 work_plans，但建议显式添加以便统计）

#### 无需 user_id 的表
- **messages**：消息记录（继承自 conversations）
- **welcome_messages**：欢迎消息（全局数据）

---

## 三、总体架构设计

### 3.1 用户角色体系

#### 角色定义
| 角色 | 权限范围 | 说明 |
|------|---------|------|
| **admin** | 超级管理员 | 查看所有数据、管理用户、查看统计数据 |
| **user** | 普通用户 | 仅访问自己的数据 |

#### 用户状态
| 状态 | 说明 |
|------|------|
| **active** | 激活（正常使用） |
| **disabled** | 禁用（禁止登录） |
| **deleted** | 已删除（软删除） |

### 3.2 数据隔离策略

#### 核心原则
1. **用户级隔离**：所有业务数据绑定到 user_id
2. **自动过滤**：后端自动过滤用户只能访问自己的数据
3. **管理员特权**：管理员可访问所有用户的数据
4. **统计隔离**：用户统计数据按用户维度统计

#### 实现方式
- **查询拦截**：通过请求拦截器自动注入 user_id 过滤条件
- **权限验证**：所有接口验证当前用户是否有权访问目标数据
- **审计日志**：记录所有数据访问和操作

---

## 四、数据库设计

### 4.1 新增表

#### 4.1.1 users 表（扩展现有字段）

```sql
-- 扩展 users 表，添加角色和状态字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'disabled', 'deleted'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS unionid VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- 注释
COMMENT ON COLUMN users.role IS '用户角色：user（普通用户）、admin（管理员）';
COMMENT ON COLUMN users.status IS '用户状态：active（激活）、disabled（禁用）、deleted（已删除）';
COMMENT ON COLUMN users.unionid IS '微信 UnionID（用于跨应用用户识别）';
COMMENT ON COLUMN users.last_login_at IS '最后登录时间';
```

#### 4.1.2 user_profiles 表（用户档案）

```sql
-- 用户档案表
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  real_name VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(100),
  department VARCHAR(100),
  position VARCHAR(100),
  company VARCHAR(100),
  employee_id VARCHAR(50),
  gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
  birthday DATE,
  address TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_department ON user_profiles(department);
CREATE INDEX IF NOT EXISTS idx_user_profiles_company ON user_profiles(company);

-- 唯一约束
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profiles_user_id_unique ON user_profiles(user_id);

-- 注释
COMMENT ON TABLE user_profiles IS '用户档案表';
COMMENT ON COLUMN user_profiles.real_name IS '真实姓名';
COMMENT ON COLUMN user_profiles.department IS '部门';
COMMENT ON COLUMN user_profiles.position IS '职位';
COMMENT ON COLUMN user_profiles.employee_id IS '员工工号';
```

#### 4.1.3 user_statistics 表（用户统计）

```sql
-- 用户统计表
CREATE TABLE IF NOT EXISTS user_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stat_date DATE DEFAULT CURRENT_DATE,
  dialog_count INTEGER DEFAULT 0,              -- 对话次数
  message_count INTEGER DEFAULT 0,             -- 消息数
  lexicon_count INTEGER DEFAULT 0,             -- 语料库数量
  lexicon_item_count INTEGER DEFAULT 0,        -- 语料条目数
  hot_word_count INTEGER DEFAULT 0,            -- 热点词数量
  viral_replica_count INTEGER DEFAULT 0,       -- 爆款复刻次数
  scheduled_task_count INTEGER DEFAULT 0,      -- 定时任务数
  work_plan_count INTEGER DEFAULT 0,           -- 工作计划数
  work_plan_task_count INTEGER DEFAULT 0,      -- 工作计划任务数
  upload_file_count INTEGER DEFAULT 0,         -- 上传文件数
  upload_file_size BIGINT DEFAULT 0,           -- 上传文件总大小（字节）
  total_tokens_used BIGINT DEFAULT 0,          -- 总使用 Token 数
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_user_statistics_user_id ON user_statistics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_statistics_stat_date ON user_statistics(stat_date);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_statistics_user_date_unique ON user_statistics(user_id, stat_date);

-- 注释
COMMENT ON TABLE user_statistics IS '用户统计表';
COMMENT ON COLUMN user_statistics.stat_date IS '统计日期';
COMMENT ON COLUMN user_statistics.upload_file_size IS '上传文件总大小（字节）';
```

#### 4.1.4 operation_logs 表（操作日志）

```sql
-- 操作日志表
CREATE TABLE IF NOT EXISTS operation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  operation VARCHAR(50) NOT NULL,              -- 操作类型（login, logout, upload, delete, view等）
  resource_type VARCHAR(50),                   -- 资源类型（dialog, lexicon, file等）
  resource_id UUID,                            -- 资源ID
  details JSONB,                               -- 操作详情
  ip_address VARCHAR(50),                      -- IP地址
  user_agent TEXT,                             -- 用户代理
  status VARCHAR(20) DEFAULT 'success',        -- 操作状态（success, failed）
  error_message TEXT,                          -- 错误信息
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_operation_logs_user_id ON operation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_operation_logs_operation ON operation_logs(operation);
CREATE INDEX IF NOT EXISTS idx_operation_logs_resource ON operation_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_operation_logs_created_at ON operation_logs(created_at DESC);

-- 注释
COMMENT ON TABLE operation_logs IS '操作日志表';
COMMENT ON COLUMN operation_logs.operation IS '操作类型：login（登录）、logout（登出）、upload（上传）、delete（删除）、view（查看）';
```

### 4.2 修改现有表

#### 4.2.1 lexicons 表（添加 user_id）

```sql
-- 为 lexicons 表添加 user_id 字段
ALTER TABLE lexicons ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_lexicons_user_id ON lexicons(user_id);

-- 注释
COMMENT ON COLUMN lexicons.user_id IS '所属用户ID';
```

#### 4.2.2 work_plan_tasks 表（添加 user_id）

```sql
-- 为 work_plan_tasks 表添加 user_id 字段（冗余字段，便于统计）
ALTER TABLE work_plan_tasks ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_work_plan_tasks_user_id ON work_plan_tasks(user_id);

-- 注释
COMMENT ON COLUMN work_plan_tasks.user_id IS '所属用户ID（冗余字段，便于统计）';
```

### 4.3 触发器

#### 4.3.1 自动更新 user_profiles.updated_at

```sql
-- 触发器函数
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 触发器
CREATE TRIGGER update_user_profiles_updated_at_trigger
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at();
```

#### 4.3.2 自动更新 user_statistics.updated_at

```sql
-- 触发器函数
CREATE OR REPLACE FUNCTION update_user_statistics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 触发器
CREATE TRIGGER update_user_statistics_updated_at_trigger
  BEFORE UPDATE ON user_statistics
  FOR EACH ROW
  EXECUTE FUNCTION update_user_statistics_updated_at();
```

---

## 五、后端服务设计

### 5.1 服务架构

```
server/src/
├── admin/                      # 管理模块
│   ├── admin.module.ts
│   ├── admin.controller.ts     # 管理员接口
│   └── admin.service.ts        # 管理服务
├── user-profile/               # 用户档案模块
│   ├── user-profile.module.ts
│   ├── user-profile.controller.ts
│   └── user-profile.service.ts
├── statistics/                 # 统计模块
│   ├── statistics.module.ts
│   ├── statistics.controller.ts
│   └── statistics.service.ts
├── audit/                      # 审计日志模块
│   ├── audit.module.ts
│   ├── audit.controller.ts
│   ├── audit.service.ts
│   └── audit.interceptor.ts    # 审计拦截器
├── guards/                     # 权限守卫
│   ├── admin.guard.ts          # 管理员守卫
│   └── active-user.guard.ts    # 激活用户守卫
├── interceptors/               # 拦截器
│   ├── data-isolation.interceptor.ts  # 数据隔离拦截器
│   └── logging.interceptor.ts         # 日志拦截器
└── user/                       # 用户模块（扩展现有）
    ├── user.module.ts
    ├── user.controller.ts
    └── user.service.ts
```

### 5.2 核心服务说明

#### 5.2.1 AdminService（管理员服务）

**功能**：
- 获取用户列表（分页、筛选）
- 获取用户详情
- 修改用户角色
- 禁用/激活用户
- 获取用户统计数据
- 获取全局统计数据

**接口设计**：

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/admin/users | 获取用户列表 | admin |
| GET | /api/admin/users/:id | 获取用户详情 | admin |
| PUT | /api/admin/users/:id/role | 修改用户角色 | admin |
| PUT | /api/admin/users/:id/status | 修改用户状态 | admin |
| GET | /api/admin/users/:id/statistics | 获取用户统计 | admin |
| GET | /api/admin/statistics/overview | 获取全局统计 | admin |

#### 5.2.2 UserProfileService（用户档案服务）

**功能**：
- 获取用户档案
- 更新用户档案
- 获取部门列表
- 获取员工列表

**接口设计**：

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/profile | 获取当前用户档案 | user |
| PUT | /api/profile | 更新当前用户档案 | user |
| GET | /api/admin/profiles/:userId | 获取用户档案 | admin |
| GET | /api/admin/departments | 获取部门列表 | admin |
| GET | /api/admin/employees | 获取员工列表 | admin |

#### 5.2.3 StatisticsService（统计服务）

**功能**：
- 获取用户统计数据（按日期）
- 获取全局统计数据（所有用户汇总）
- 获取活跃用户排行
- 获取功能使用统计

**接口设计**：

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/statistics/me | 获取当前用户统计 | user |
| GET | /api/statistics/me/:date | 获取指定日期统计 | user |
| GET | /api/admin/statistics/overview | 获取全局统计 | admin |
| GET | /api/admin/statistics/users | 获取用户统计列表 | admin |
| GET | /api/admin/statistics/ranking/active | 获取活跃用户排行 | admin |

#### 5.2.4 AuditService（审计服务）

**功能**：
- 记录用户操作
- 查询操作日志
- 统计操作行为

**接口设计**：

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/admin/audit/logs | 查询操作日志 | admin |
| GET | /api/admin/audit/users/:userId | 查询用户操作记录 | admin |
| GET | /api/admin/audit/statistics | 操作统计 | admin |

### 5.3 数据隔离拦截器（DataIsolationInterceptor）

**功能**：
- 拦截所有查询请求
- 自动注入 user_id 过滤条件
- 管理员绕过过滤（可查询所有数据）

**实现原理**：

```typescript
@Injectable()
export class DataIsolationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // 从 JWT 中提取

    if (user && user.role !== 'admin') {
      // 非管理员用户，自动注入 user_id
      request.query.userId = user.id;
    }

    return next.handle();
  }
}
```

### 5.4 权限守卫（Guards）

#### AdminGuard（管理员守卫）

```typescript
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return user && user.role === 'admin';
  }
}
```

#### ActiveUserGuard（激活用户守卫）

```typescript
@Injectable()
export class ActiveUserGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return user && user.status === 'active';
  }
}
```

---

## 六、前端页面设计

### 6.1 页面结构

```
src/pages/
├── admin/                      # 管理员页面
│   ├── user-management/        # 用户管理
│   │   ├── index.tsx           # 用户列表
│   │   └── detail.tsx          # 用户详情
│   ├── data-monitor/           # 数据监控
│   │   ├── index.tsx           # 数据概览
│   │   └── statistics.tsx      # 统计分析
│   └── audit-log/              # 审计日志
│       └── index.tsx           # 操作日志
├── profile/                    # 个人中心
│   ├── index.tsx               # 个人信息
│   └── statistics.tsx          # 个人统计
└── settings/                   # 设置
    └── index.tsx               # 系统设置
```

### 6.2 导航结构

#### TabBar（管理员专属）
- 首页（星小帮对话）
- 数据监控（新增）
- 用户管理（新增）
- 我的（个人中心）

#### 普通用户无 TabBar，保持现有导航

### 6.3 页面功能说明

#### 6.3.1 用户管理页面

**功能**：
- 用户列表展示（头像、昵称、角色、状态、部门、职位）
- 用户筛选（按角色、状态、部门）
- 用户详情查看
- 用户角色修改
- 用户禁用/激活
- 用户统计查看

**UI布局**：
```
┌─────────────────────────────────────────┐
│ 用户管理                      搜索框     │
├─────────────────────────────────────────┤
│ 筛选：[全部] [管理员] [普通用户]         │
│ 状态：[全部] [激活] [禁用]               │
├─────────────────────────────────────────┤
│ ┌────┐ 张三 (管理员)  部门：技术部       │
│ │👤 │ 状态：激活  最后登录：2小时前      │
│ └────┤ 操作：[详情] [编辑] [禁用]        │
├─────────────────────────────────────────┤
│ ┌────┐ 李四 (用户)  部门：市场部         │
│ │👤 │ 状态：激活  最后登录：1天前        │
│ └────┤ 操作：[详情] [编辑] [禁用]        │
└─────────────────────────────────────────┘
```

#### 6.3.2 数据监控页面

**功能**：
- 用户总数统计
- 活跃用户统计
- 功能使用统计（对话、语料库、爆款复刻等）
- 数据量统计（文件数量、存储大小）
- 用户活跃度排行榜

**UI布局**：
```
┌─────────────────────────────────────────┐
│ 数据监控仪表板                          │
├─────────────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐    │
│ │用户数│ │活跃数│ │对话数│ │文件数│    │
│ │  25  │ │  18  │ │1563  │ │ 892  │    │
│ └──────┘ └──────┘ └──────┘ └──────┘    │
├─────────────────────────────────────────┤
│ 功能使用统计                            │
│ ┌─────────────────────────────────────┐ │
│ │ 对话：563次  语料库：234个          │ │
│ │ 爆款：89次  定时任务：45个          │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ 活跃用户排行榜                          │
│ 1. 张三 (技术部) - 156次                │
│ 2. 李四 (市场部) - 89次                 │
│ 3. 王五 (运营部) - 67次                 │
└─────────────────────────────────────────┘
```

#### 6.3.3 审计日志页面

**功能**：
- 操作日志查询
- 按用户筛选
- 按时间范围筛选
- 按操作类型筛选
- 操作详情查看

**UI布局**：
```
┌─────────────────────────────────────────┐
│ 审计日志            [筛选] [导出]       │
├─────────────────────────────────────────┤
│ 时间：2024-01-15 10:30:25              │
│ 用户：张三 (技术部)                     │
│ 操作：上传文件                          │
│ 资源：multimedia_resources/xxx         │
│ 状态：成功                              │
├─────────────────────────────────────────┤
│ 时间：2024-01-15 10:28:15              │
│ 用户：李四 (市场部)                     │
│ 操作：删除语料库                        │
│ 资源：lexicons/xxx                      │
│ 状态：成功                              │
└─────────────────────────────────────────┘
```

#### 6.3.4 个人中心（普通用户）

**功能**：
- 个人信息展示和编辑
- 个人统计查看
- 设置（退出登录等）

---

## 七、数据隔离实现方案

### 7.1 查询过滤

#### 方式一：Service 层手动过滤

```typescript
// 在 Service 中根据当前用户 ID 过滤数据
async getLexicons(userId: string) {
  return this.db.select().from(lexicons).where(eq(lexicons.userId, userId));
}
```

#### 方式二：拦截器自动过滤（推荐）

```typescript
@Injectable()
export class DataIsolationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user.role !== 'admin') {
      // 在查询参数中注入 userId
      request.body.userId = user.id;
      request.query.userId = user.id;
    }

    return next.handle();
  }
}
```

### 7.2 权限验证

```typescript
// Controller 中使用守卫
@Controller('lexicons')
@UseGuards(JwtAuthGuard, ActiveUserGuard)
export class LexiconController {
  @Get()
  async getLexicons(@Request() req, @Query('userId') userId?: string) {
    // 如果是管理员，可以查询所有用户的数据
    if (req.user.role === 'admin' && userId) {
      return this.lexiconService.getUserLexicons(userId);
    }
    // 普通用户只能查询自己的数据
    return this.lexiconService.getUserLexicons(req.user.id);
  }
}
```

### 7.3 审计日志记录

```typescript
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const logData = {
      userId: user.id,
      operation: this.getOperation(request),
      resourceType: this.getResourceType(request),
      resourceId: request.params.id,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    };

    return next.handle().pipe(
      tap({
        next: () => this.auditService.log({ ...logData, status: 'success' }),
        error: (error) => this.auditService.log({ ...logData, status: 'failed', errorMessage: error.message }),
      })
    );
  }
}
```

---

## 八、实施步骤

### 阶段一：数据库改造（1-2天）

**任务**：
1. ✅ 创建数据库迁移脚本 `005_add_multi_user_support.sql`
2. ✅ 执行迁移脚本
3. ✅ 验证表结构和索引

**交付物**：
- 数据库迁移脚本
- 数据库结构文档

### 阶段二：后端服务实现（3-4天）

**任务**：
1. ✅ 扩展 UserService（角色管理、状态管理）
2. ✅ 实现 UserProfileService
3. ✅ 实现 AdminService
4. ✅ 实现 StatisticsService
5. ✅ 实现 AuditService
6. ✅ 创建权限守卫
7. ✅ 创建数据隔离拦截器
8. ✅ 创建审计拦截器
9. ✅ 修改现有 Service，添加 user_id 关联

**交付物**：
- 完整的后端服务代码
- API 接口文档

### 阶段三：前端页面开发（3-4天）

**任务**：
1. ✅ 创建用户管理页面
2. ✅ 创建数据监控页面
3. ✅ 创建审计日志页面
4. ✅ 创建个人中心页面
5. ✅ 添加管理员入口
6. ✅ 实现权限路由守卫

**交付物**：
- 完整的前端页面代码
- 管理员功能演示

### 阶段四：集成测试（1-2天）

**任务**：
1. ✅ 测试用户登录和角色切换
2. ✅ 测试数据隔离功能
3. ✅ 测试管理员权限
4. ✅ 测试统计数据准确性
5. ✅ 测试审计日志记录
6. ✅ 压力测试和性能优化

**交付物**：
- 测试报告
- 性能优化文档

### 阶段五：文档和部署（1天）

**任务**：
1. ✅ 编写用户手册
2. ✅ 编写管理员手册
3. ✅ 编写部署文档
4. ✅ 生产环境部署

**交付物**：
- 用户手册
- 管理员手册
- 部署文档

---

## 九、安全考虑

### 9.1 数据安全
- **数据隔离**：严格的 user_id 隔离，防止数据泄露
- **权限控制**：细粒度的角色权限控制
- **审计日志**：所有操作可追溯
- **敏感信息加密**：用户敏感信息加密存储

### 9.2 访问安全
- **JWT Token**：使用 JWT 进行身份验证
- **Token 刷新**：实现 Token 自动刷新机制
- **IP 白名单**：管理员操作 IP 白名单（可选）
- **操作频率限制**：防止恶意操作

### 9.3 隐私保护
- **最小化数据收集**：只收集必要的用户信息
- **数据脱敏**：日志中敏感信息脱敏处理
- **数据删除权**：支持用户数据删除

---

## 十、后续扩展功能

### 10.1 组织架构管理
- 部门层级管理
- 岗位权限管理
- 组织架构图展示

### 10.2 数据共享
- 语料库共享
- 工作计划协作
- 团队数据看板

### 10.3 高级统计
- 使用趋势分析
- 数据质量评估
- 异常行为检测

### 10.4 通知系统
- 系统通知
- 任务提醒
- 异常告警

---

## 十一、风险与应对

### 11.1 技术风险
| 风险 | 影响 | 应对措施 |
|------|------|---------|
| 数据迁移失败 | 业务中断 | 充分测试，备份原始数据 |
| 性能下降 | 用户体验差 | 优化查询，添加索引 |
| 权限漏洞 | 数据泄露 | 严格代码审查，安全测试 |

### 11.2 业务风险
| 风险 | 影响 | 应对措施 |
|------|------|---------|
| 用户接受度低 | 推广困难 | 提供培训，优化体验 |
| 数据隔离不彻底 | 隐私泄露 | 严格测试，多轮验证 |
| 管理员操作不当 | 误操作 | 操作日志，二次确认 |

---

## 十二、总结

本方案实现了企业多用户版本的核心需求：

1. ✅ **多用户支持**：完善的用户体系和权限管理
2. ✅ **数据隔离**：严格的用户级数据隔离机制
3. ✅ **管理监督**：管理员可查看所有数据和操作日志
4. ✅ **统计分析**：丰富的用户统计和全局统计功能
5. ✅ **安全可控**：完善的权限控制和审计日志

预计实施周期：**8-12个工作日**

---

## 附录

### A. 数据库迁移脚本模板

```sql
-- 文件路径：server/database/migrations/005_add_multi_user_support.sql

-- 1. 扩展 users 表
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'disabled', 'deleted'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS unionid VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- 2. 创建 user_profiles 表
CREATE TABLE IF NOT EXISTS user_profiles (
  -- (完整表结构见上文)
);

-- 3. 创建 user_statistics 表
CREATE TABLE IF NOT EXISTS user_statistics (
  -- (完整表结构见上文)
);

-- 4. 创建 operation_logs 表
CREATE TABLE IF NOT EXISTS operation_logs (
  -- (完整表结构见上文)
);

-- 5. 修改现有表，添加 user_id
ALTER TABLE lexicons ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_lexicons_user_id ON lexicons(user_id);

ALTER TABLE work_plan_tasks ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_work_plan_tasks_user_id ON work_plan_tasks(user_id);

-- 6. 创建触发器
-- (完整触发器代码见上文)
```

### B. API 接口清单

#### 管理员接口
| 路径 | 方法 | 说明 |
|------|------|------|
| `/api/admin/users` | GET | 获取用户列表 |
| `/api/admin/users/:id` | GET | 获取用户详情 |
| `/api/admin/users/:id/role` | PUT | 修改用户角色 |
| `/api/admin/users/:id/status` | PUT | 修改用户状态 |
| `/api/admin/users/:id/statistics` | GET | 获取用户统计 |
| `/api/admin/statistics/overview` | GET | 获取全局统计 |
| `/api/admin/statistics/users` | GET | 获取用户统计列表 |
| `/api/admin/statistics/ranking/active` | GET | 获取活跃用户排行 |
| `/api/admin/audit/logs` | GET | 查询操作日志 |
| `/api/admin/audit/users/:userId` | GET | 查询用户操作记录 |
| `/api/admin/profiles/:userId` | GET | 获取用户档案 |
| `/api/admin/departments` | GET | 获取部门列表 |
| `/api/admin/employees` | GET | 获取员工列表 |

#### 用户接口
| 路径 | 方法 | 说明 |
|------|------|------|
| `/api/profile` | GET | 获取当前用户档案 |
| `/api/profile` | PUT | 更新当前用户档案 |
| `/api/statistics/me` | GET | 获取当前用户统计 |
| `/api/statistics/me/:date` | GET | 获取指定日期统计 |

---

**文档版本**：v1.0
**创建日期**：2025-01-15
**最后更新**：2025-01-15
