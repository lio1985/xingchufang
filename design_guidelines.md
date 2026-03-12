# 星厨房创作助手 - 设计指南

## 品牌定位
- **应用名称**: 星厨房创作助手
- **设计风格**: 深色科技风、专业、高效、现代化
- **目标用户**: 内容创作者、运营人员、营销团队
- **核心理念**: 通过高效工具提升内容生产效率与品牌曝光

## 配色方案

### 主色板
- **背景色**:
  - 深色背景: `bg-slate-900` (#0f172a)
  - 次级背景: `bg-slate-800` (#1e293b)
  - 卡片背景: `bg-slate-800/80` (半透明)

- **主色调**:
  - 科技蓝: `text-blue-400` (#60a5fa) - 用于标题和重点文字
  - 亮白色: `text-white` (#ffffff) - 主要文字
  - 浅灰色: `text-slate-300` (#cbd5e1) - 次要文字

- **强调色**:
  - 成功绿: `text-emerald-400` (#34d399)
  - 警告黄: `text-amber-400` (#fbbf24)
  - 信息蓝: `bg-blue-500/20` + `text-blue-400`

### 边框与分隔线
- 卡片边框: `border-slate-700`
- 分隔线: `border-slate-700` 或 `divide-slate-700`

## 字体规范
- **H1 标题**: `text-2xl font-bold text-white` (24px, 粗体)
- **H2 标题**: `text-xl font-semibold text-blue-400` (20px, 半粗体)
- **H3 标题**: `text-lg font-medium text-white` (18px, 中等粗细)
- **正文**: `text-base text-slate-300` (16px)
- **小字**: `text-sm text-slate-400` (14px)
- **微字**: `text-xs text-slate-500` (12px)

## 间距系统
- **页面边距**: `p-4` 或 `p-6` (16px / 24px)
- **卡片内边距**: `p-4` 或 `p-5` (16px / 20px)
- **组件间距**: `gap-3` 或 `gap-4` (12px / 16px)
- **外边距**: `mb-4` 或 `mb-6` (16px / 24px)

## 组件规范

### 卡片组件
```tsx
<View className="bg-slate-800 rounded-xl border border-slate-700 p-4">
  <Text className="block text-lg font-semibold text-white mb-3">卡片标题</Text>
  <Text className="block text-base text-slate-300">卡片内容</Text>
</View>
```

### 按钮样式
- **主按钮**: `bg-blue-500 text-white rounded-lg px-6 py-3 font-medium`
- **次按钮**: `bg-slate-700 text-white rounded-lg px-6 py-3 font-medium`
- **幽灵按钮**: `bg-transparent text-blue-400 border border-blue-400 rounded-lg px-6 py-3 font-medium`

### 输入框组件
```tsx
<View className="bg-slate-700 rounded-lg border border-slate-600 p-3">
  <Input
    className="w-full bg-transparent text-white placeholder-slate-400"
    placeholder="请输入内容"
  />
</View>
```

### 列表项
```tsx
<View className="flex items-center gap-3 py-3 border-b border-slate-700">
  <View className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
    <Lightbulb size={20} color="#60a5fa" />
  </View>
  <View className="flex-1">
    <Text className="block text-base font-medium text-white">列表项标题</Text>
    <Text className="block text-sm text-slate-400">列表项描述</Text>
  </View>
</View>
```

### 标签
- **主标签**: `bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm`
- **次标签**: `bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-sm`
- **状态标签**:
  - 进行中: `bg-amber-500/20 text-amber-400`
  - 已完成: `bg-emerald-500/20 text-emerald-400`
  - 待开始: `bg-slate-700 text-slate-400`

### 空状态组件
```tsx
<View className="flex flex-col items-center justify-center py-12">
  <Text className="block text-slate-500 text-sm">暂无数据</Text>
</View>
```

## 图标使用
- **系统图标**: 使用 `lucide-react-taro` 图标库
- **尺寸规范**:
  - 大图标: `size={24}` 或 `size={28}`
  - 中图标: `size={20}`
  - 小图标: `size={16}`
- **颜色规范**:
  - 主色: `color="#60a5fa"` (blue-400)
  - 强调色: `color="#34d399"` (emerald-400)
  - 次色: `color="#cbd5e1"` (slate-300)

## 导航结构

### TabBar 配置
- 首页: 首页图标
- 四大系统: 系统图标
- 闭环流程: 流程图标
- 实施计划: 计划图标

### 页面路由
```
/pages/index/index            - 首页（概览与导航）
/pages/topic-system/index     - 智能选题生成系统
/pages/content-system/index   - 内容生成与拆分系统
/pages/lexicon-system/index   - 语料优化系统
/pages/viral-system/index     - 爆款复刻系统
/pages/flow/index             - 闭环流程可视化
/pages/plan/index             - 实施计划进度
```

## 小程序约束
- **包体积限制**: 注意控制图片和字体资源大小
- **图片策略**: 使用 WebP 格式，启用懒加载
- **性能优化**:
  - 使用 `lazyLoad` 属性
  - 长列表使用虚拟滚动
  - 避免不必要的 re-render
- **深色模式优化**: 确保文字对比度符合 WCAG AA 标准
- **跨端兼容**:
  - 所有 Text 组件添加 `block` 类
  - Input 组件使用 View 包裹
  - Platform 检测: `const isWeapp = Taro.getEnv() === Taro.ENV_TYPE.WEAPP`
