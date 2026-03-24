# 星厨房内容创作助手 - 设计指南

## 1. 品牌定位

**产品灵魂**：精品厨房 + 创意工坊
**视觉隐喻**：想象一个精品咖啡吧台——黑色金属架、深色木质台面、温暖的黄铜装饰灯、咖啡师专注的神情。每个工具都整齐排列，每个元素都有存在的理由。

**目标用户**：内容创作者、厨房行业从业者
**设计理念**：专业感与手作温度并存，克制但有温度

## 2. 设计风格：「Warm Industrial 温暖工业风」

### 核心视觉语言
- **材质感**：深色背景模拟哑光金属质感
- **光影感**：暖色点缀模拟黄铜/铜管灯光
- **留白感**：大量负空间，每个元素呼吸
- **网格感**：清晰的视觉层级和分组

### 禁忌清单
- ❌ 科技蓝+圆角卡片+蓝紫色渐变
- ❌ 纯白背景+单调阴影
- ❌ 所有元素都是大圆角
- ❌ 过于花哨的渐变和阴影
- ❌ 拥挤的布局和过小的间距

## 3. 配色方案

### 主色调
```css
--background: #0a0a0b;        /* 深黑 - 哑光金属感 */
--background-elevated: #141416; /* 卡片/浮层背景 */
--background-subtle: #1a1a1d;  /* 次级背景 */
--foreground: #fafafa;         /* 主文字 - 亮白 */
--foreground-muted: #a1a1aa;    /* 次级文字 - 暖灰 */
--border: #27272a;              /* 边框 - 暗金属 */
```

### 功能色
```css
--primary: #f59e0b;            /* 琥珀金 - 主操作色 */
--primary-foreground: #000000; /* 主色上的文字 */
--accent: #fb923c;             /* 橙色 - 强调色 */
--accent-secondary: #fbbf24;   /* 亮黄 - 辅助强调 */

--success: #22c55e;            /* 翠绿 - 成功 */
--warning: #f59e0b;            /* 琥珀 - 警告 */
--destructive: #ef4444;        /* 红色 - 危险/错误 */
--info: #3b82f6;               /* 蓝色 - 信息 */
```

### 渐变（用于特殊场景）
```css
--gradient-primary: linear-gradient(135deg, #f59e0b 0%, #fb923c 100%);
--gradient-surface: linear-gradient(180deg, #141416 0%, #0a0a0b 100%);
```

## 4. 字体规范

### 字体族
```css
font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "PingFang SC", "Microsoft YaHei", sans-serif;
```

### 字号层级
```css
--text-xs: 0.75rem;    /* 12px - 标签/徽章 */
--text-sm: 0.875rem;   /* 14px - 次级文字 */
--text-base: 1rem;      /* 16px - 正文 */
--text-lg: 1.125rem;   /* 18px - 小标题 */
--text-xl: 1.25rem;     /* 20px - 标题 */
--text-2xl: 1.5rem;    /* 24px - 大标题 */
--text-3xl: 1.875rem;  /* 30px - 页面标题 */
```

### 字重
```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

## 5. 间距系统

```css
--spacing-xs: 0.25rem;   /* 4px */
--spacing-sm: 0.5rem;    /* 8px */
--spacing-md: 1rem;       /* 16px */
--spacing-lg: 1.5rem;    /* 24px */
--spacing-xl: 2rem;      /* 32px */
--spacing-2xl: 3rem;     /* 48px */

--radius-sm: 0.375rem;    /* 6px - 小圆角 */
--radius-md: 0.5rem;      /* 8px - 中圆角 */
--radius-lg: 0.75rem;    /* 12px - 大圆角 */
--radius-xl: 1rem;       /* 16px - 卡片圆角 */
```

## 6. 组件使用原则

### 组件库优先
- 所有通用 UI 组件（Button/Input/Dialog/Card/Toast/Tabs/Badge 等）**必须**优先使用 `@/components/ui/*`
- 禁止用 `View/Text` 手搓通用组件外观
- 只有页面结构容器或组件库确实缺失的能力，才使用 `@tarojs/components`

### 可用组件清单
| 组件 | 用途 | 选型提示 |
|------|------|----------|
| Button | 操作按钮 | 主次按钮区分 |
| Input | 单行输入 | 带前缀/后缀 |
| Textarea | 多行输入 | 固定高度+滚动 |
| Card | 信息卡片 | 分组内容 |
| Badge | 状态标签 | 小型标签 |
| Tabs | 切换视图 | 标签页切换 |
| Dialog | 确认弹窗 | 危险操作确认 |
| Toast | 操作反馈 | 轻提示 |
| Skeleton | 加载占位 | 骨架屏 |
| Avatar | 用户头像 | 圆形显示 |
| Select | 下拉选择 | 单项选择 |
| Switch | 开关切换 | 布尔状态 |

### 页面组件选型流程
1. 拆解页面 UI 单元
2. 每个单元映射到组件库
3. 确认组件满足需求
4. 组合成完整页面

## 7. 页面结构规范

### 页面布局
```
┌─────────────────────────────────┐
│ Header (固定顶部)               │
│ - 标题居中                      │
│ - 左侧返回/菜单                 │
│ - 右侧操作按钮                  │
├─────────────────────────────────┤
│ Content (可滚动)                │
│ - 页面主要信息                  │
│ - 卡片分组展示                  │
│ - 表单输入区域                  │
├─────────────────────────────────┤
│ Footer (固定底部,可选)           │
│ - 主要操作按钮                  │
│ - TabBar (如果需要)              │
└─────────────────────────────────┘
```

### 页面边距
```css
--page-padding-x: 1rem;     /* 页面左右边距 */
--card-padding: 1rem;       /* 卡片内边距 */
--section-gap: 1.5rem;      /* 区块间距 */
```

### 卡片设计
```css
.card {
  background: var(--background-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
}
```

## 8. 导航结构

### TabBar 配置 (app.config.ts)
```
首页 | 灵感 | 客资 | 我的
```

### 页面跳转规范
- TabBar 页面：使用 `switchTab()`
- 普通页面：使用 `navigateTo()`
- 详情页：从列表页进入详情

### 页面标题规范
- 页面标题使用 `config.ts` 的 `navigationBarTitleText`
- 避免在页面内容中重复标题

## 9. 状态设计

### 空状态
- 居中显示图标+文字
- 配合操作按钮引导用户

### 加载状态
- 骨架屏优先（Skeleton 组件）
- 避免大范围 loading 遮罩

### 错误状态
- 显示错误图标+提示
- 提供重试按钮

### 成功反馈
- Toast 轻提示
- 跳转或刷新页面

## 10. 小程序约束

### 性能优化
- 列表使用 `scroll-view`
- 图片使用懒加载
- 避免过深嵌套

### 包体积
- 控制图片资源大小
- 按需加载组件
- 避免大图背景

### 适配
- 使用 `rpx` 单位
- 安全区域适配
- 暗黑模式支持
