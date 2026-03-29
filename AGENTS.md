# 项目上下文

## 项目简介

**星厨房商品库** - 快捷搜索选品系统，支持多人协作共享和图片上传管理。

### 核心功能
- 📦 商品数据管理（5541条商品数据）
- 🔍 快速搜索筛选（关键词、供应商、分类）
- 📸 商品图片上传管理（支持单张上传和批量导入）
- 👥 多人协作共享访问
- 🔐 简单权限管理（管理员密码保护）
- 📊 数据导出（导出为Excel）
- 📱 响应式设计（支持手机端）
- ⭐ 商品推荐管理（爆款、新款、特价、精选）

### 版本技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **Storage**: S3 对象存储（图片存储）

## 目录结构

```
├── public/                 # 静态资源
├── scripts/                # 构建与启动脚本
│   ├── build.sh            # 构建脚本
│   ├── dev.sh              # 开发环境启动脚本
│   ├── prepare.sh          # 预处理脚本
│   ├── start.sh            # 生产环境启动脚本
│   └── import-products.ts  # 商品数据导入脚本
├── src/
│   ├── app/                # 页面路由与布局
│   │   ├── api/            # API 路由
│   │   │   ├── auth/route.ts           # 登录认证接口
│   │   │   ├── filter-options/route.ts # 筛选选项接口
│   │   │   ├── images/                 # 图片相关接口
│   │   │   │   └── batch-import/route.ts # 批量导入图片
│   │   │   ├── products/               # 商品相关接口
│   │   │   │   ├── route.ts            # 商品列表接口
│   │   │   │   ├── export/route.ts     # 商品导出接口
│   │   │   │   └── [id]/               # 商品详情相关
│   │   │   │       ├── route.ts        # 商品详情接口
│   │   │   │       └── images/         # 图片管理
│   │   │   │           ├── route.ts    # 图片CRUD
│   │   │   │           └── primary/route.ts # 设置主图
│   │   │   └── recommendations/        # 推荐管理接口
│   │   │       ├── route.ts            # 推荐增删改查
│   │   │       └── check/route.ts      # 批量检查推荐状态
│   │   ├── admin/          # 管理后台
│   │   │   ├── page.tsx               # 管理后台首页
│   │   │   └── recommendations/        # 推荐管理页面
│   │   │       └── page.tsx
│   │   ├── batch-import/   # 批量导入页面
│   │   ├── login/          # 登录页面
│   │   ├── products/[id]/  # 商品详情页面
│   │   ├── page.tsx        # 主页面（商品列表）
│   │   ├── layout.tsx      # 根布局
│   │   └── globals.css     # 全局样式
│   ├── components/ui/      # Shadcn UI 组件库
│   ├── hooks/              # 自定义 Hooks
│   ├── lib/                # 工具库
│   │   ├── utils.ts        # 通用工具函数 (cn)
│   │   └── auth.ts         # 权限验证工具
│   ├── storage/database/   # 数据库相关
│   │   ├── supabase-client.ts  # Supabase 客户端
│   │   └── shared/schema.ts    # 数据库表结构定义
│   └── server.ts           # 自定义服务端入口
├── next.config.ts          # Next.js 配置
├── package.json            # 项目依赖管理
└── tsconfig.json           # TypeScript 配置
```

- 项目文件（如 app 目录、pages 目录、components 等）默认初始化到 `src/` 目录下。

## 数据库表结构

### products（商品表）
- id: 商品ID（主键）
- name: 商品名称
- brand: 品牌
- spec: 规格
- params: 参数
- price: 价格
- supplier: 供应商
- level1_category: 一级分类
- level2_category: 二级分类
- created_at/updated_at: 时间戳

### product_images（商品图片表）
- id: 图片ID（主键）
- product_id: 商品ID（外键）
- image_key: 图片存储key
- is_primary: 是否主图
- created_at: 创建时间

### product_recommendations（商品推荐表）
- id: 推荐ID（主键）
- product_id: 商品ID（外键）
- recommend_type: 推荐类型（hot/new/sale/featured）
- start_date: 推荐开始时间（可选）
- end_date: 推荐结束时间（可选）
- sort_order: 排序权重
- created_by: 创建人
- created_at/updated_at: 时间戳
- 唯一约束: (product_id, recommend_type)

## 推荐类型说明

| 类型 | 标识 | 显示标签 | 颜色 | 说明 |
|------|------|---------|------|------|
| 爆款 | hot | 爆款 | 红色 | 热销商品推荐 |
| 新款 | new | 新款 | 绿色 | 新品上架推荐 |
| 特价款 | sale | 特价 | 橙色 | 促销活动商品 |
| 精选 | featured | 精选 | 蓝色 | 优质商品推荐 |

## 权限管理

系统使用简单的管理员密码保护机制：
- 默认密码：`admin123`（可通过环境变量 `ADMIN_PASSWORD` 修改）
- 管理员权限：上传图片、批量导入、设置主图、删除图片、管理推荐
- 普通用户：浏览商品、搜索筛选、导出数据

## 包管理规范

**仅允许使用 pnpm** 作为包管理器，**严禁使用 npm 或 yarn**。
**常用命令**：
- 安装依赖：`pnpm add <package>`
- 安装开发依赖：`pnpm add -D <package>`
- 安装所有依赖：`pnpm install`
- 移除依赖：`pnpm remove <package>`

## 开发规范

- **项目理解加速**：初始可以依赖项目下`package.json`文件理解项目类型，如果没有或无法理解退化成阅读其他文件。
- **Hydration 错误预防**：严禁在 JSX 渲染逻辑中直接使用 typeof window、Date.now()、Math.random() 等动态数据。必须使用 'use client' 并配合 useEffect + useState 确保动态内容仅在客户端挂载后渲染；同时严禁非法 HTML 嵌套（如 <p> 嵌套 <div>）。


## UI 设计与组件规范 (UI & Styling Standards)

- 模板默认预装核心组件库 `shadcn/ui`，位于`src/components/ui/`目录下
- Next.js 项目**必须默认**采用 shadcn/ui 组件、风格和规范，**除非用户指定用其他的组件和规范。**

## API 接口说明

### GET /api/products
获取商品列表，支持分页和筛选
- 参数：keyword, supplier, level1Category, level2Category, page, pageSize
- 返回：商品列表、总数、分页信息

### GET /api/products/export
导出商品数据为Excel
- 参数：keyword, supplier, level1Category, level2Category
- 返回：Excel文件下载

### GET /api/filter-options
获取筛选选项
- 返回：供应商列表、一级分类列表、二级分类列表

### GET /api/products/[id]
获取商品详情

### GET /api/products/[id]/images
获取指定商品的所有图片

### POST /api/products/[id]/images
上传商品图片（需要管理员权限）
- 参数：file（图片文件）, isPrimary（是否主图）

### PATCH /api/products/[id]/images/primary
设置主图（需要管理员权限）
- 参数：imageId

### DELETE /api/products/[id]/images?imageId=xxx
删除商品图片（需要管理员权限）

### POST /api/images/batch-import
批量导入图片（需要管理员权限）
- 参数：file（Excel/CSV文件）
- 格式：商品编码, 图片URL

### POST /api/auth
管理员登录
- 参数：password

### GET /api/auth
检查登录状态

### DELETE /api/auth
登出

### GET /api/recommendations
获取推荐列表
- 参数：type（推荐类型）, activeOnly（只获取有效的）, withProducts（包含商品详情）, limit
- 返回：推荐列表

### POST /api/recommendations
添加推荐（需要管理员权限）
- 参数：productId, recommendType, startDate, endDate, sortOrder

### PATCH /api/recommendations
更新推荐（需要管理员权限）
- 参数：id, recommendType, startDate, endDate, sortOrder

### DELETE /api/recommendations
删除推荐（需要管理员权限）
- 参数：id 或 productId + recommendType

### GET /api/recommendations/check
批量检查商品推荐状态
- 参数：productIds（逗号分隔的商品ID）
- 返回：每个商品的推荐状态



