# 小程序开发指南

## 🚀 快速开始

### 1. 启动开发服务

```bash
# 方式一：同时启动小程序构建和后端服务（推荐）
pnpm dev

# 方式二：分别启动
pnpm dev:weapp    # 启动小程序开发模式（热更新）
pnpm dev:server   # 启动后端 API 服务
```

### 2. 构建生产版本

```bash
# 构建小程序 + 后端
pnpm build

# 仅构建小程序
pnpm build:weapp

# 仅构建后端
pnpm build:server
```

---

## 📁 项目结构

```
/workspace/projects/
├── src/                    # 前端源代码
│   ├── pages/             # 页面
│   ├── components/        # 组件
│   └── app.tsx            # 应用入口
├── server/                # 后端源代码
│   ├── src/              # NestJS 源码
│   └── dist/             # 后端构建产物
├── dist-weapp/            # 小程序构建产物（微信开发者工具导入此目录）
├── config/                # 构建配置
└── package.json           # 项目配置
```

---

## 🔧 开发流程

### 1. 本地开发

```bash
# 1. 启动开发服务
pnpm dev

# 2. 打开微信开发者工具
# 导入项目：/workspace/projects/dist-weapp
# AppID：在 .env.local 中配置 TARO_APP_WEAPP_APPID

# 3. 修改代码后自动热更新
# 小程序代码：src/
# 后端代码：server/src/
```

### 2. 生产部署

```bash
# 1. 构建生产版本
pnpm build

# 2. 上传小程序代码
pnpm preview:weapp

# 3. 后端部署
pm2 start ecosystem.config.cjs --env production
```

---

## ⚠️ 重要说明

### 已移除 H5 支持

本项目专注于小程序开发，已移除 H5 相关文件：

- ❌ `dist-web/` - H5 构建产物
- ❌ `server-static.js` - H5 静态文件服务器
- ❌ `nginx/` - Nginx 配置
- ❌ PM2 中的 `star-kitchen-web` 应用

### 服务说明

- **后端 API**：http://localhost:3000
- **小程序预览**：使用微信开发者工具导入 `dist-weapp/`
- **不再需要**：5000 端口的静态文件服务器

---

## 🐛 常见问题

### Q1: 修改代码后小程序不更新？

```bash
# 检查小程序开发服务是否运行
ps aux | grep "taro build"

# 重启开发服务
pnpm kill:all
pnpm dev
```

### Q2: 后端 API 无法访问？

```bash
# 检查后端服务状态
curl http://localhost:3000/api/health

# 查看后端日志
tail -f /tmp/api.log

# 重启后端服务
cd server && node dist/main.js
```

### Q3: 如何查看构建产物？

```bash
# 小程序产物
ls dist-weapp/

# 后端产物
ls server/dist/
```

---

## 📝 开发规范

### 1. 代码风格

- 使用 ESLint 检查：`pnpm lint`
- 自动修复：`pnpm lint:fix`
- TypeScript 类型检查：`pnpm tsc`

### 2. 提交代码

```bash
# 提交前自动检查
git commit  # 会自动运行 lint-staged
```

### 3. 网络请求

使用统一的 Network 封装：

```typescript
import { Network } from '@/network'

// GET 请求
const data = await Network.request({ url: '/api/users' })

// POST 请求
const result = await Network.request({
  url: '/api/users',
  method: 'POST',
  data: { name: 'test' }
})
```

---

## 🎯 开发建议

1. **优先使用 Taro API**：使用 `Taro.navigateTo` 而非 `wx.navigateTo`
2. **样式使用 Tailwind**：优先使用 Tailwind 类名
3. **组件优先复用**：使用 `@/components/ui/*` 中的组件
4. **网络请求统一**：使用 `Network.request` 封装

---

## 📞 技术支持

遇到问题请检查：
1. 服务是否正常启动（`pnpm dev`）
2. 端口是否被占用（3000、5000）
3. 日志文件（`/tmp/api.log`）
4. 微信开发者工具控制台
