# 页面优化通用模板

## 1. 导入 Lucide 图标

```tsx
import {
  Lightbulb,        // 灵感
  Target,           // 选题
  Sparkles,         // 创作
  Activity,         // 数据/统计
  Users,            // 客户
  Recycle,          // 回收
  BookOpen,         // 知识
  Settings,         // 设置
  ChevronLeft,      // 返回
  ChevronRight,     // 前进
  Plus,             // 添加
  Search,           // 搜索
  Star,             // 收藏
  StarOff,          // 取消收藏
  Trash2,           // 删除
  Edit,             // 编辑
  Clock,            // 时间
  Check,            // 完成
  X,                // 关闭
  AlertCircle,      // 提示
  RefreshCw,        // 刷新
  Filter,           // 筛选
  Download,         // 下载
  Share2,           // 分享
  Eye,              // 查看
  EyeOff,           // 隐藏
  Lock,             // 锁定
  Unlock,           // 解锁
  Mail,             // 邮件
  Phone,            // 电话
  MapPin,           // 位置
  Calendar,         // 日历
  FileText,         // 文件
  Image as ImageIcon, // 图片
  Video,            // 视频
  Music,            // 音乐
  ShoppingBag,      // 购物
  Package,          // 包裹
  TrendingUp,       // 上升趋势
  TrendingDown,     // 下降趋势
  DollarSign,       // 金额
  BarChart,         // 柱状图
  PieChart,         // 饼图
  Activity,         // 折线图/活动
} from 'lucide-react-taro'
```

## 2. 图标使用规范

```tsx
// ✅ 正确用法
<Lightbulb size={24} color="#f59e0b" />
<Target size={20} className="text-primary" />
<Plus size={32} color="#000" />

// ❌ 错误用法 - 不要用 emoji
<Text>💡</Text>
<Text>🎯</Text>
```

## 3. 通用页面结构

```tsx
import { View, Text, ScrollView } from '@tarojs/components'
import { ChevronLeft, Plus } from 'lucide-react-taro'
import '@/styles/pages.css'
import './index.css'

const PageTemplate = () => {
  return (
    <View className="page-wrapper">
      {/* Header */}
      <View className="page-header">
        <View className="header-top">
          <View className="header-left">
            <View className="back-button" onClick={() => Taro.navigateBack()}>
              <ChevronLeft size={32} color="#fafafa" />
            </View>
            <View className="header-title-group">
              <Text className="header-title">页面标题</Text>
              <Text className="header-subtitle">副标题</Text>
            </View>
          </View>
          
          <View className="primary-action-btn" onClick={handleAction}>
            <Plus size={40} color="#000" />
          </View>
        </View>
        
        {/* 搜索框（可选） */}
        <View className="search-box">
          <Search size={28} color="#71717a" />
          <Input className="search-input" placeholder="搜索..." />
        </View>
      </View>

      {/* 内容区域 */}
      <View className="content-area">
        {loading ? (
          <LoadingState />
        ) : data.length === 0 ? (
          <EmptyState />
        ) : (
          <ContentList />
        )}
      </View>
    </View>
  )
}
```

## 4. 空状态组件

```tsx
// 空状态
<View className="empty-state">
  <Inbox size={80} color="#71717a" />
  <Text className="empty-title">暂无内容</Text>
  <Text className="empty-desc">点击下方按钮添加第一条记录</Text>
  <Text className="empty-action" onClick={() => setShowAdd(true)}>
    立即添加
  </Text>
</View>

// 使用 Lucide 图标
import { Inbox, FileX, Search, AlertCircle } from 'lucide-react-taro'
```

## 5. 加载状态

```tsx
// 加载状态
<View className="loading-state">
  <RefreshCw size={64} color="#f59e0b" className="animate-spin" />
  <Text className="loading-text">加载中...</Text>
</View>

// 使用 Lucide 图标
import { RefreshCw, Loader } from 'lucide-react-taro'
```

## 6. 卡片组件

```tsx
// 内容卡片
<View 
  className={`content-card ${isSelected ? 'content-card-selected' : ''}`}
  onClick={handleClick}
>
  <View className="card-header">
    <View style={{ flex: 1 }}>
      <Text className="card-title">{title}</Text>
      <Text className="card-desc">{description}</Text>
    </View>
    
    <View className="card-actions">
      <Star 
        size={28} 
        color={isStarred ? "#f59e0b" : "#71717a"}
        onClick={() => handleToggleStar(id)}
      />
      <Trash2 
        size={28} 
        color="#ef4444"
        onClick={() => handleDelete(id)}
      />
    </View>
  </View>
  
  {/* 标签 */}
  <View className="label-group">
    {tags.map(tag => (
      <View className="label-item label-primary">{tag}</View>
    ))}
  </View>
  
  {/* 时间戳 */}
  <Text className="timestamp">{formatTime(createdAt)}</Text>
</View>
```

## 7. 按钮样式

```tsx
// 主要按钮
<View className="action-btn-primary" onClick={handleClick}>
  <Text className="action-btn-primary-text">确认操作</Text>
</View>

// 次要按钮
<View className="action-btn-secondary" onClick={handleClick}>
  <Text className="action-btn-secondary-text">取消</Text>
</View>

// 图标按钮
<View className="primary-action-btn" onClick={handleClick}>
  <Plus size={40} color="#000" />
</View>
```

## 8. 弹窗组件

```tsx
{showModal && (
  <View className="modal-overlay" onClick={() => setShowModal(false)}>
    <View className="modal-content" onClick={(e) => e.stopPropagation()}>
      <View className="modal-header">
        <Text className="modal-title">弹窗标题</Text>
        <X size={28} color="#71717a" onClick={() => setShowModal(false)} />
      </View>
      
      {/* 表单内容 */}
      <View className="form-group">
        <Text className="form-label">字段名称</Text>
        <Input className="form-input" placeholder="请输入..." />
      </View>
      
      {/* 提交按钮 */}
      <View className="action-btn-primary" onClick={handleSubmit}>
        <Text className="action-btn-primary-text">提交</Text>
      </View>
    </View>
  </View>
)}
```

## 9. 统计卡片

```tsx
<View className="stat-card">
  <View className="stat-card-title">
    <BarChart size={24} color="#71717a" />
    <Text>核心指标</Text>
  </View>
  
  <View className="stat-grid">
    {/* 营收 */}
    <View className="stat-item">
      <View className="stat-item-header">
        <DollarSign size={24} color="#71717a" />
        <Text className="stat-item-label">营收</Text>
      </View>
      <Text className="stat-item-value stat-item-value-primary">
        ¥{formatMoney(revenue)}
      </Text>
      <View className="stat-item-trend">
        <TrendingUp size={16} color="#22c55e" />
        <Text style={{ fontSize: '20px', color: '#22c55e' }}>+12.5%</Text>
      </View>
    </View>
    
    {/* 订单 */}
    <View className="stat-item">
      <View className="stat-item-header">
        <Package size={24} color="#71717a" />
        <Text className="stat-item-label">订单</Text>
      </View>
      <Text className="stat-item-value">{orders}</Text>
      <View className="stat-item-trend">
        <TrendingUp size={16} color="#22c55e" />
        <Text style={{ fontSize: '20px', color: '#22c55e' }}>+8.3%</Text>
      </View>
    </View>
  </View>
</View>
```

## 10. 快速替换表

### Emoji → Lucide 图标映射

| Emoji | Lucide 图标 | 用途 |
|-------|------------|------|
| 💡 | Lightbulb | 灵感/创意 |
| 🎯 | Target | 选题/目标 |
| ✨ | Sparkles | 创作/魔法 |
| 📊 | Activity/BarChart | 数据/统计 |
| 👥 | Users | 用户/客户 |
| 🔄 | Recycle/RefreshCw | 回收/刷新 |
| ⚙️ | Settings | 设置 |
| 📚 | BookOpen | 知识/阅读 |
| ⭐ | Star | 收藏/评分 |
| 🗑 | Trash2 | 删除 |
| ✏️ | Edit | 编辑 |
| 🔍 | Search | 搜索 |
| ➕ | Plus | 添加 |
| ✕ | X | 关闭 |
| ✓ | Check | 完成 |
| ⏳ | RefreshCw/Loader | 加载 |
| 📌 | MapPin/Pin | 标记/位置 |
| 📦 | Package | 包裹 |
| 💰 | DollarSign | 金额 |
| 🔥 | Flame/AlertCircle | 热门/提示 |
| 📝 | FileText | 文档 |
| 📅 | Calendar | 日期 |
| ⏰ | Clock | 时间 |
| 🔒 | Lock | 锁定 |
| 👁 | Eye | 查看 |
| 📧 | Mail | 邮件 |
| 📱 | Phone | 电话 |

## 11. 颜色规范

```tsx
// 主色
color: '#f59e0b'  // 琥珀金

// 文字颜色
color: '#fafafa'  // 主文字（亮白）
color: '#a1a1aa'  // 次级文字（暖灰）
color: '#71717a'  // 辅助文字（灰色）
color: '#52525b'  // 次要文字（深灰）

// 功能色
color: '#22c55e'  // 成功（绿色）
color: '#f59e0b'  // 警告（琥珀）
color: '#ef4444'  // 错误（红色）
color: '#3b82f6'  // 信息（蓝色）

// 图标颜色
<Star color="#f59e0b" />           // 主色
<Trash2 color="#ef4444" />         // 危险操作
<Check color="#22c55e" />          // 成功
<AlertCircle color="#f59e0b" />    // 警告
<Info color="#3b82f6" />           // 信息
```

## 12. 交互效果

```tsx
// 所有可点击元素添加 cursor: pointer
<View className="interactive" onClick={handleClick}>

// 卡片悬停效果
<View className="card-hover">

// 按钮按下效果
<View className="btn-press">

// 输入框聚焦效果
<Input className="input-focus" />
```
