# 星厨房创作助手 - 设计指南

## 品牌定位
- **应用名称**: 星厨房创作助手
- **设计风格**: 渐变科技风、精致卡片、品牌感强
- **目标用户**: 内容创作者、运营人员、营销团队
- **核心理念**: 通过高效工具提升内容生产效率与品牌曝光

## 配色方案（渐变科技风）

### 主色板
- **品牌渐变**:
  - 顶部渐变: `from-blue-600 via-blue-500 to-cyan-500` - 蓝到青的科技感渐变
  - 快捷入口: `from-orange-500 to-amber-500` - 橙到琥珀的行动号召
  
- **功能色系**:
  - 客资管理: `#3B82F6` (蓝色)
  - 厨具回收: `#10B981` (绿色)
  - 知识分享: `#8B5CF6` (紫色)
  - 选题策划: `#06B6D4` (青色)
  - 内容创作: `#6366F1` (靛蓝)
  - 语料优化: `#14B8A6` (青绿)
  - 爆款复刻: `#EC4899` (粉红)
  - 直播数据: `#F59E0B` (琥珀)

- **背景色**:
  - 主背景: `#F8FAFC` (slate-50)
  - 卡片背景: `#FFFFFF` (白色)
  - 图标背景: 各功能的浅色版本

- **文字色**:
  - 主文字: `#1E293B` (slate-800)
  - 次文字: `#64748B` (slate-500)
  - 辅助文字: `#94A3B8` (slate-400)

## 视觉设计原则

### 1. 渐变应用
- **顶部品牌区**: 使用蓝色到青色的渐变，营造科技感和专业感
- **快捷入口**: 使用橙色渐变突出行动号召
- **避免过度**: 仅在关键区域使用渐变，其他区域保持简洁

### 2. 卡片设计
- **圆角**: 统一使用 `rounded-2xl` (16px)
- **阴影**: 轻微阴影 `shadow-sm` 或自定义 `box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05)`
- **背景**: 纯白色背景 `bg-white`
- **内边距**: 统一 `p-5` (20px)

### 3. 图标系统
- **风格**: 线性图标 + 彩色背景块
- **尺寸**: `size={24}` 或 `size={20}`
- **背景**: 每个功能独特的浅色背景
- **来源**: 统一使用 `lucide-react-taro`

### 4. 间距规范
- **页面边距**: `px-5` (20px) - 适合手机阅读
- **卡片间距**: `gap-3` (12px)
- **顶部品牌区内边距**: `px-5 pt-14 pb-8`
- **功能区标题**: `mb-4`
- **底部留白**: `h-4` (16px)

## 组件规范

### 品牌区组件
```tsx
<View className="bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 px-5 pt-14 pb-8">
  <Text className="block text-3xl font-bold text-white mb-1">星厨房</Text>
  <Text className="block text-sm text-blue-100 font-medium tracking-wider">STAR KITCHEN</Text>
</View>
```

### 快捷入口卡片
```tsx
<View className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-5 shadow-lg">
  <View className="flex items-center gap-4">
    <View className="w-14 h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
      <Icon size={28} color="#FFFFFF" />
    </View>
    <View className="flex-1">
      <Text className="block text-xl font-bold text-white mb-1">标题</Text>
      <Text className="block text-sm text-white/90">描述</Text>
    </View>
  </View>
</View>
```

### 功能卡片
```tsx
<View className="bg-white rounded-2xl p-5 shadow-sm">
  <View 
    className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
    style={{ backgroundColor: iconBgColor }}
  >
    <Icon size={24} color={iconColor} />
  </View>
  <Text className="block text-base font-semibold text-slate-800 mb-1">标题</Text>
  <Text className="block text-xs text-slate-500">描述</Text>
</View>
```

## 布局结构

### 页面层次
```
顶部品牌区（渐变背景）
├── 品牌标题 + 副标题
├── 功能按钮（消息、设置、登录等）
└── 快捷入口卡片（橙色渐变）

功能中心区（白色背景）
├── 区块标题 + 副标题
└── 功能卡片网格（2列）
    ├── 图标（带背景）
    ├── 主标题
    └── 副标题
```

## 设计细节优化

### 1. 视觉层次
- **顶部品牌区**: 最强的视觉冲击力，渐变背景
- **快捷入口**: 次强的视觉引导，橙色渐变
- **功能卡片**: 统一的视觉节奏，轻微阴影

### 2. 色彩协调
- **主色调**: 蓝色系贯穿整个界面
- **功能色**: 每个功能独立的色彩标识
- **背景色**: 浅色系，保持清爽感

### 3. 交互反馈
- **点击缩放**: `active:scale-[0.98]`
- **平滑过渡**: `transition-transform`
- **背景模糊**: `backdrop-blur`

## 设计禁忌

### ❌ 避免的做法
1. **过度使用渐变**: 仅在关键区域使用
2. **阴影过重**: 使用轻微阴影，避免厚重感
3. **颜色混乱**: 每个功能保持独立色彩体系
4. **间距不统一**: 严格遵循间距规范
5. **图标风格混用**: 统一使用线性图标

### ✅ 推荐的做法
1. **统一圆角**: 所有卡片使用 `rounded-2xl`
2. **轻微阴影**: 增加层次感但不厚重
3. **色彩呼应**: 图标颜色与功能背景色协调
4. **留白充足**: 保持呼吸感和可读性
5. **对齐统一**: 所有元素左对齐

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
3. **间距充足**: 使用 `p-5` (20px) 作为卡片内边距
4. **单列布局**: 顶部区域单列，功能卡片 2 列
5. **固定元素**: 底部操作栏预留安全区域 (bottom: 50px+)
