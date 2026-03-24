# 星厨房创作助手 - 设计指南

## 品牌定位
- **应用名称**: 星厨房创作助手
- **设计风格**: 扁平化设计、清爽科技风、专业高效
- **目标用户**: 内容创作者、运营人员、营销团队
- **核心理念**: 通过高效工具提升内容生产效率与品牌曝光

## 配色方案（蓝色科技风）

### 主色板
- **主色调**:
  - 科技蓝: `#2563EB` (blue-600) - 主题色、按钮、重点
  - 浅蓝: `#3B82F6` (blue-500) - 悬停状态、次要元素
  - 天蓝: `#60A5FA` (blue-400) - 图标、装饰
  
- **强调色**:
  - 橙色 CTA: `#F97316` (orange-500) - 行动号召按钮
  - 成功绿: `#10B981` (emerald-500)
  - 警告黄: `#F59E0B` (amber-500)
  - 错误红: `#EF4444` (red-500)

- **背景色**:
  - 主背景: `#F8FAFC` (slate-50) - 清爽浅灰
  - 卡片背景: `#FFFFFF` (white)
  - 次级背景: `#F1F5F9` (slate-100)
  - 点缀背景: `#EFF6FF` (blue-50)

- **文字色**:
  - 主文字: `#1E293B` (slate-800)
  - 次文字: `#475569` (slate-600)
  - 辅助文字: `#64748B` (slate-500)
  - 弱化文字: `#94A3B8` (slate-400)

- **边框与分隔**:
  - 主边框: `#E2E8F0` (slate-200)
  - 浅边框: `#F1F5F9` (slate-100)
  - 蓝色边框: `#BFDBFE` (blue-200)

### 渐变色（仅用于特殊强调）
- 蓝色渐变: `from-blue-500 to-blue-600`
- 橙色渐变: `from-orange-400 to-orange-500`

## 字体规范
- **H1 标题**: `text-2xl font-bold text-slate-800` (24px)
- **H2 标题**: `text-xl font-semibold text-slate-800` (20px)
- **H3 标题**: `text-lg font-medium text-slate-800` (18px)
- **正文**: `text-base text-slate-600` (16px)
- **小字**: `text-sm text-slate-500` (14px)
- **微字**: `text-xs text-slate-400` (12px)

## 间距系统（手机端优化）
- **页面边距**: `p-4` (16px) - 适合手机阅读
- **卡片内边距**: `p-5` (20px)
- **组件间距**: `gap-3` 或 `gap-4` (12px / 16px)
- **外边距**: `mb-4` 或 `mb-6` (16px / 24px)
- **图标与文字间距**: `gap-3` (12px)

## 组件规范

### 卡片组件（扁平化设计）
```tsx
<View className="bg-white rounded-2xl border border-slate-200 p-5">
  <Text className="block text-lg font-semibold text-slate-800 mb-2">卡片标题</Text>
  <Text className="block text-sm text-slate-600">卡片内容</Text>
</View>
```

### 按钮样式（扁平化）
- **主按钮**: `bg-blue-600 text-white rounded-xl px-6 py-3 font-medium`
- **次按钮**: `bg-slate-100 text-slate-700 rounded-xl px-6 py-3 font-medium`
- **CTA 按钮**: `bg-orange-500 text-white rounded-xl px-6 py-3 font-bold`
- **幽灵按钮**: `bg-transparent text-blue-600 border-2 border-blue-600 rounded-xl px-6 py-3 font-medium`

### 图标规范（扁平化图标）
- **图标库**: 使用 `lucide-react-taro` 图标库
- **尺寸规范**:
  - 大图标: `size={24}`
  - 中图标: `size={20}`
  - 小图标: `size={16}`
- **颜色规范**:
  - 主色: `color="#2563EB"` (blue-600)
  - 强调色: `color="#F97316"` (orange-500)
  - 次色: `color="#64748B"` (slate-500)
- **图标背景**:
  - 蓝色: `bg-blue-50`
  - 橙色: `bg-orange-50`
  - 灰色: `bg-slate-100`

### 输入框组件
```tsx
<View className="bg-white rounded-xl border border-slate-200 p-4">
  <Input
    className="w-full bg-transparent text-slate-800 placeholder-slate-400"
    placeholder="请输入内容"
  />
</View>
```

### 列表项（扁平化设计）
```tsx
<View className="flex items-center gap-3 py-4 border-b border-slate-100">
  <View className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
    <Lightbulb size={24} color="#2563EB" />
  </View>
  <View className="flex-1">
    <Text className="block text-base font-medium text-slate-800">列表项标题</Text>
    <Text className="block text-sm text-slate-500">列表项描述</Text>
  </View>
</View>
```

### 标签
- **主标签**: `bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm font-medium`
- **次标签**: `bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-sm`
- **状态标签**:
  - 进行中: `bg-amber-100 text-amber-700`
  - 已完成: `bg-emerald-100 text-emerald-700`
  - 待开始: `bg-slate-100 text-slate-600`

### 空状态组件
```tsx
<View className="flex flex-col items-center justify-center py-12">
  <Text className="block text-slate-400 text-sm">暂无数据</Text>
</View>
```

## 设计原则（扁平化设计）

### 视觉特点
1. **无阴影**: 使用边框代替阴影，保持清爽简洁
2. **纯色块**: 避免复杂渐变，使用纯色或简单双色渐变
3. **圆角设计**: 使用大圆角 (rounded-xl/2xl) 营造友好感
4. **充足留白**: 保持足够的间距，提升可读性
5. **扁平图标**: 使用线条图标，避免立体效果

### 交互设计
1. **点击反馈**: 使用 `active:scale-[0.98]` 实现点击缩放效果
2. **颜色过渡**: 使用 `transition-colors duration-200` 实现平滑过渡
3. **状态区分**: 使用颜色和边框区分不同状态
4. **触摸友好**: 按钮最小高度 44px，方便点击

## 导航结构

### TabBar 配置
- 首页: Home 图标 (蓝色)
- 功能中心: Grid 图标 (蓝色)
- 数据统计: BarChart 图标 (蓝色)
- 个人中心: User 图标 (蓝色)

### 页面路由
```
/pages/index/index            - 首页（概览与导航）
/pages/topic-system/index     - 智能选题生成系统
/pages/content-system/index   - 内容生成与拆分系统
/pages/lexicon-system/index   - 语料优化系统
/pages/viral-system/index     - 爆款复刻系统
/pages/customer/index         - 客资管理
/pages/recycle/index          - 厨具回收
/pages/knowledge-share/index  - 知识分享
/pages/live-data/dashboard    - 直播数据统计
```

## 小程序约束
- **包体积限制**: 注意控制图片和字体资源大小
- **图片策略**: 使用 WebP 格式，启用懒加载
- **性能优化**:
  - 使用 `lazyLoad` 属性
  - 长列表使用虚拟滚动
  - 避免不必要的 re-render
- **跨端兼容**:
  - 所有 Text 组件添加 `block` 类
  - Input 组件使用 View 包裹
  - Platform 检测: `const isWeapp = Taro.getEnv() === Taro.ENV_TYPE.WEAPP`

## 移动端适配要点
1. **字体大小**: 正文不小于 16px，确保可读性
2. **触摸区域**: 按钮最小 44x44px
3. **间距充足**: 使用 p-4 (16px) 作为最小间距
4. **单列布局**: 优先使用单列布局，避免横向滚动
5. **固定元素**: 底部操作栏预留安全区域 (bottom: 50px+)
