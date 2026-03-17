# 星厨房创作助手 - 设计指南

## 品牌定位
- **应用名称**: 星厨房创作助手
- **设计风格**: 清爽科技风、专业、高效、现代化
- **目标用户**: 内容创作者、运营人员、营销团队
- **核心理念**: 通过高效工具提升内容生产效率与品牌曝光

## 配色方案

### 主色板
- **背景色**:
  - 主背景: `#F0F9FF` (冰蓝色)
  - 次级背景: `#E0F2FE` (浅蓝)
  - 卡片背景: `#FFFFFF` (纯白)
  - 卡片次级: `#F8FAFC` (极浅灰)

- **主色调**:
  - 科技蓝: `#0EA5E9` - 主题色、按钮、重点
  - 深蓝: `#0284C7` - 悬停状态、强调
  - 浅蓝: `rgba(14, 165, 233, 0.15)` - 背景点缀

- **文字色**:
  - 主文字: `#1E3A5F` (深灰蓝)
  - 次文字: `#475569` (灰蓝)
  - 辅助文字: `#64748B` (中灰)
  - 弱化文字: `#94A3B8` (浅灰)

- **边框与分隔线**:
  - 卡片边框: `#E2E8F0`
  - 分隔线: `#F1F5F9`
  - 聚焦边框: `#0EA5E9`

- **强调色**:
  - 成功绿: `#10B981`
  - 警告黄: `#F59E0B`
  - 错误红: `#EF4444`
  - 信息蓝: `#0EA5E9`

## 字体规范
- **H1 标题**: `text-2xl font-bold text-slate-800` (24px, 粗体)
- **H2 标题**: `text-xl font-semibold text-sky-600` (20px, 半粗体, 科技蓝)
- **H3 标题**: `text-lg font-medium text-slate-800` (18px, 中等粗细)
- **正文**: `text-base text-slate-600` (16px)
- **小字**: `text-sm text-slate-500` (14px)
- **微字**: `text-xs text-slate-400` (12px)

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
