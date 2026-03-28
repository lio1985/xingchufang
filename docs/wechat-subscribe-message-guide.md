# 微信小程序订阅消息模板申请指南

## 一、登录微信公众平台

1. 访问 [微信公众平台](https://mp.weixin.qq.com/)
2. 使用小程序管理员账号登录
3. 进入「功能」→「订阅消息」

## 二、申请消息模板

### 场景1：直播提醒

**模板标题**：直播提醒

**模板内容**：
```
{{thing1.DATA}}
开播时间：{{time2.DATA}}
主播：{{thing3.DATA}}
```

**关键词选择**：
- `thing1`：直播标题（如：直播即将开始）
- `time2`：开播时间
- `thing3`：主播名称

**申请理由**：
用于直播开始前提醒用户观看直播，提升用户体验。

---

### 场景2：订单状态通知

**模板标题**：订单状态更新

**模板内容**：
```
订单编号：{{character_string1.DATA}}
订单状态：{{phrase2.DATA}}
更新时间：{{time3.DATA}}
```

**关键词选择**：
- `character_string1`：订单编号
- `phrase2`：订单状态（如：已发货、已完成）
- `time3`：更新时间

**申请理由**：
用于订单状态变更时通知用户，让用户及时了解订单进度。

---

### 场景3：客户跟进提醒

**模板标题**：客户跟进提醒

**模板内容**：
```
客户姓名：{{thing1.DATA}}
跟进事项：{{thing2.DATA}}
提醒时间：{{time3.DATA}}
```

**关键词选择**：
- `thing1`：客户姓名
- `thing2`：跟进事项
- `time3`：提醒时间

**申请理由**：
用于销售人员跟进客户提醒，提升客户服务质量。

---

### 场景4：AI创作完成通知

**模板标题**：创作完成通知

**模板内容**：
```
创作类型：{{thing1.DATA}}
完成时间：{{time2.DATA}}
创作结果：{{thing3.DATA}}
```

**关键词选择**：
- `thing1`：创作类型（如：短视频脚本、文章）
- `time2`：完成时间
- `thing3`：创作结果摘要

**申请理由**：
用于AI内容创作完成后通知用户查看结果，提升用户粘性。

---

### 场景5：设备订单通知

**模板标题**：新订单通知

**模板内容**：
```
订单标题：{{thing1.DATA}}
订单金额：{{amount2.DATA}}
发布时间：{{time3.DATA}}
```

**关键词选择**：
- `thing1`：订单标题
- `amount2`：订单金额
- `time3`：发布时间

**申请理由**：
用于新设备订单发布时通知用户，帮助用户及时抢占订单。

---

## 三、获取模板ID

1. 模板申请通过后，在「订阅消息」→「公共模板库」中找到已申请的模板
2. 点击「添加」按钮，将模板添加到「我的模板」
3. 在「我的模板」中查看模板ID（格式如：`ABCDEFGHIJKLMN`）
4. 将模板ID填写到前端代码中

## 四、修改代码中的模板ID

在 `src/pages/subscribe-message/index.tsx` 中，将模板ID替换为实际的微信模板ID：

```typescript
const [templates, setTemplates] = useState<SubscribeTemplate[]>([
  {
    id: 'live_reminder',
    templateId: 'YOUR_LIVE_REMINDER_TEMPLATE_ID', // 替换为实际的模板ID
    title: '直播提醒',
    // ...
  },
  // ...
]);
```

## 五、配置环境变量

在 `.env.local` 文件中添加微信小程序配置：

```env
WX_APPID=你的小程序AppID
WX_SECRET=你的小程序AppSecret
```

获取方式：
1. 登录微信公众平台
2. 进入「开发」→「开发管理」→「开发设置」
3. 查看 AppID 和 AppSecret

## 六、执行数据库迁移

在 Supabase 的 SQL Editor 中执行迁移脚本：

```bash
# 迁移文件路径
server/migrations/005_create_subscribe_messages.sql
```

## 七、测试订阅消息

1. 在小程序中进入「消息订阅」页面
2. 点击订阅按钮，微信会弹出订阅授权框
3. 选择「允许」完成订阅
4. 在后端调用发送接口测试

测试接口示例（使用 curl）：

```bash
curl -X POST http://localhost:3000/api/subscribe/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "userId": "用户ID",
    "templateId": "live_reminder",
    "data": {
      "thing1": { "value": "直播即将开始" },
      "time2": { "value": "2024-01-20 14:00" },
      "thing3": { "value": "张三" }
    }
  }'
```

## 八、注意事项

1. **一次性订阅**：用户每次授权只能接收一条消息，如需持续推送请引导用户多次订阅
2. **模板审核**：模板申请通常需要1-3个工作日审核
3. **消息内容**：必须严格按照模板格式填写，否则会发送失败
4. **用户授权**：必须在用户主动触发时弹出订阅框（如点击按钮），不能自动弹出
5. **频率限制**：每个模板每天最多推送100条消息

## 九、常见问题

### Q: 为什么发送失败返回 errcode 43101？
A: 用户拒绝接收消息，需要用户重新订阅。

### Q: 为什么发送失败返回 errcode 47003？
A: 模板参数不准确，检查模板ID和参数是否匹配。

### Q: 如何实现长期订阅？
A: 长期订阅需要特殊资质（如政务、医疗、交通、金融、教育等），可在微信公众平台申请。

### Q: 消息推送有延迟吗？
A: 订阅消息通常实时送达，但高峰期可能有1-2分钟延迟。

---

## 十、相关文档

- [微信小程序订阅消息官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/subscribe-message.html)
- [订阅消息服务端接口](https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/subscribe-message/subscribeMessage.send.html)
- [模板消息运营规范](https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/subscribe-message.html)
