# 审核提醒功能使用指南

## 功能说明

为了帮助管理员及时审核新用户，系统提供了以下审核提醒功能：

1. **首页徽标提醒** - 管理员首页右上角显示待审核用户数量徽标
2. **后台首页提醒** - 管理后台首页显示待审核用户提示卡片
3. **点击跳转** - 点击提醒可直接跳转到待审核用户列表

## 功能展示

### 1. 首页徽标提醒

**显示位置**：首页右上角的管理员图标（绿色盾牌图标）

**显示内容**：
- 红色圆形徽标
- 白色数字显示待审核用户数量
- 数量超过99时显示"99+"

**触发条件**：
- 用户是管理员
- 存在待审核用户（status = 'pending'）

**交互效果**：
- 点击徽标或管理员图标 → 跳转到管理后台首页

### 2. 管理后台首页提醒

**显示位置**：管理后台首页，数据导出卡片下方

**显示内容**：
- 渐变橙色卡片背景（from-amber-500 to-orange-500）
- 铃铃图标
- "待审核用户"标题
- "有 X 位用户等待审核"文字
- 数字徽标（X）
- "点击前往审核用户"说明
- "立即审核"按钮

**触发条件**：
- 存在待审核用户（status = 'pending'）

**交互效果**：
- 点击卡片 → 跳转到待审核用户列表（携带status=pending参数）

## 技术实现

### 后端接口

**获取待审核用户数量**
```typescript
GET /api/admin/pending-users/count

响应：
{
  code: 200,
  msg: 'success',
  data: {
    count: 3  // 待审核用户数量
  }
}
```

**接口说明**：
- 使用Supabase count查询
- 只返回数量，不返回用户列表
- 提高性能，避免数据传输

### 前端实现

**1. 首页徽标提醒**（`src/pages/index/index.tsx`）

```typescript
// 状态管理
const [pendingUsersCount, setPendingUsersCount] = useState(0);

// 加载待审核用户数量（仅管理员）
useEffect(() => {
  if (isAdmin) {
    const loadPendingUsersCount = async () => {
      try {
        const response = await Network.request({
          url: '/api/admin/pending-users/count',
          method: 'GET',
        });

        if (response.statusCode === 200 && response.data?.data) {
          setPendingUsersCount(response.data.data.count || 0);
        }
      } catch (error) {
        console.error('加载待审核用户数量失败:', error);
      }
    };

    loadPendingUsersCount();
  }
}, [isAdmin]);

// 徽标显示
{pendingUsersCount > 0 && (
  <View className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-slate-900">
    <Text className="block text-white text-xs font-bold">
      {pendingUsersCount > 99 ? '99+' : pendingUsersCount}
    </Text>
  </View>
)}
```

**2. 管理后台首页提醒**（`src/pages/admin/dashboard/index.tsx`）

```typescript
// 状态管理
const [pendingUsersCount, setPendingUsersCount] = useState(0);

// 加载函数
const loadPendingUsersCount = async () => {
  try {
    const res = await Network.request({
      url: '/api/admin/pending-users/count',
      method: 'GET',
    });

    if (res.data && res.data.data) {
      setPendingUsersCount(res.data.data.count || 0);
    }
  } catch (error: any) {
    console.error('加载待审核用户数量失败:', error);
  }
};

// 提醒卡片显示
{pendingUsersCount > 0 && (
  <View
    onClick={() => Taro.navigateTo({ url: '/pages/admin/users/index?status=pending' })}
    className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-4 relative overflow-hidden border border-amber-400/30"
  >
    {/* 卡片内容 */}
  </View>
)}
```

## 使用流程

### 场景1：管理员查看待审核用户

1. 管理员登录小程序
2. 在首页右上角看到红色徽标，显示待审核用户数量
3. 点击徽标或管理员图标，跳转到管理后台首页
4. 在管理后台首页看到橙色的"待审核用户"提示卡片
5. 点击卡片，跳转到待审核用户列表
6. 筛选条件自动设置为"待审核"
7. 选择用户，审核通过或拒绝

### 场景2：新用户注册后管理员提醒

1. 新用户点击"微信一键登录"
2. 系统创建账号，状态为"pending"
3. 管理员重新加载首页
4. 首页右上角显示红色徽标（数量+1）
5. 管理后台首页显示待审核用户提示卡片
6. 管理员点击卡片，审核新用户

### 场景3：管理员审核后提醒消失

1. 管理员将用户状态修改为"active"
2. 返回管理后台首页，刷新页面
3. 待审核用户提示卡片消失
4. 首页右上角徽标数量-1或消失

## 性能优化

### 1. 仅管理员加载
- 只有管理员角色才会加载待审核用户数量
- 普通用户不会发起这个请求，节省资源

### 2. 轻量级接口
- 接口只返回数量，不返回用户列表
- 减少数据传输量，提升响应速度

### 3. 懒加载
- 使用useEffect在组件挂载时加载
- 不会影响页面首次渲染速度

### 4. 缓存策略（可选扩展）
- 可以在本地缓存待审核用户数量
- 设置过期时间（如5分钟）
- 减少不必要的网络请求

## 扩展功能建议

### 1. 实时更新（WebSocket）
使用WebSocket实现实时提醒：
- 新用户注册时，服务器主动推送消息给管理员
- 管理员无需刷新页面即可看到提醒
- 提升用户体验

### 2. 微信模板消息
使用微信模板消息发送通知：
- 新用户注册时，发送模板消息给管理员
- 消息内容："您有 1 位新用户等待审核"
- 管理员点击消息可直接跳转到审核页面

### 3. 声音提醒
管理员收到待审核提醒时播放提示音：
- 进入管理后台首页时播放
- 需要用户授权声音权限
- 可以设置开关

### 4. 批量审核
在提醒卡片中添加批量操作按钮：
- "全部通过"按钮
- "全部拒绝"按钮
- 提升审核效率

## 测试步骤

### 前置条件
- 管理员账号已设置
- 至少有一个待审核用户

### 测试步骤

**1. 测试首页徽标提醒**
1. 使用管理员账号登录
2. 检查首页右上角是否有红色徽标
3. 检查徽标数量是否正确
4. 点击徽标，确认跳转到管理后台首页

**2. 测试管理后台首页提醒**
1. 进入管理后台首页
2. 检查是否有橙色提示卡片
3. 检查卡片内容是否正确（用户数量、文案）
4. 点击卡片，确认跳转到待审核用户列表
5. 确认筛选条件自动设置为"待审核"

**3. 测试数量更新**
1. 审核一个用户，将状态改为"active"
2. 返回首页，检查徽标数量是否减少
3. 进入管理后台首页，检查卡片是否更新
4. 审核所有待审核用户，检查提醒是否消失

**4. 测试普通用户无提醒**
1. 使用普通用户账号登录
2. 检查是否有红色徽标
3. 确认普通用户看不到审核提醒

## 常见问题

### Q1: 为什么首页徽标不显示？
**A**: 可能的原因：
- 您不是管理员账号
- 没有待审核用户
- 网络请求失败
- 缓存问题，尝试重新登录

### Q2: 为什么数量不准确？
**A**: 可能的原因：
- 数据未及时更新，尝试刷新页面
- 其他管理员正在审核
- 数据库同步延迟

### Q3: 点击提醒后没有跳转？
**A**: 检查路由是否正确配置，检查网络连接

### Q4: 如何关闭提醒？
**A**: 提醒会自动消失，当所有待审核用户都被审核后。您也可以：
- 审核所有待审核用户
- 将用户状态改为其他状态（非pending）

## 总结

审核提醒功能为管理员提供了便捷的待审核用户管理方式：
- ✅ 首页徽标提醒，一目了然
- ✅ 管理后台首页提醒，详细信息
- ✅ 点击跳转，快速审核
- ✅ 性能优化，不影响用户体验
- ✅ 仅管理员可见，安全可靠

通过这个功能，管理员可以及时发现并审核新用户，提升审核效率，改善用户体验。
