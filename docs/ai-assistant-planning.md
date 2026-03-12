# AI对话助手实现方案

## 一、整体架构

### 1.1 核心目标
通过自然语言对话，让用户能够便捷地使用小程序的所有功能，无需手动进入各个功能页面。

### 1.2 交互模式
采用**智能引导 + 渐进式参数收集**的对话模式：
- **简单场景**：直接识别意图并执行
- **复杂场景**：多轮对话收集参数，或引导用户进入参数收集界面

## 二、功能意图映射

### 2.1 意图类型定义

| 意图类型 | 功能名称 | 参数要求 | 复杂度 |
|---------|---------|---------|--------|
| `quick_note` | 灵感速记 | content, tags | 简单 |
| `topic_generation` | 选题生成 | platforms, input_sources | 中等 |
| `content_generation` | 内容生成 | topics, platforms, versions | 复杂 |
| `lexicon_optimize` | 语料优化 | input_text, lexicon_ids | 简单 |
| `viral_replicate` | 爆款复刻 | douyin_url | 简单 |

### 2.2 对话示例

#### 示例1：灵感速记（简单场景）
```
用户: "记一下，明天要去买牛排，要做一份米其林级别的牛排"
AI: "已记录您的灵感！\n\n📝 明天要去买牛排，要做一份米其林级别的牛排\n\n您可以为这个灵感添加标签吗？"
```

#### 示例2：选题生成（中等复杂度）
```
用户: "帮我生成几个美食类的选题"
AI: "好的，我来为您生成美食类的选题。请问您想在哪些平台发布？（多选）\n\n□ 抖音\n□ 小红书\n□ 视频号"
用户: "抖音和小红书"
AI: "明白了，我正在为您生成适合抖音和小红书的美食类选题..."
[显示加载状态]
AI: "✨ 已为您生成5个选题：\n\n1. 如何在家做出米其林级别的牛排？\n2. 10分钟快手早餐，上班族必备！\n3. 3款低成本但高颜值的网红甜点\n...\n\n需要我为您生成对应的内容吗？"
```

#### 示例3：内容生成（复杂场景）
```
用户: "我要生成内容"
AI: "好的！请先告诉我：\n\n1️⃣ 您想生成什么内容？（从选题中选择或输入新想法）\n2️⃣ 发布到哪些平台？\n3️⃣ 需要几个版本？\n\n您可以一次性告诉我，也可以分步告诉我~"
```

## 三、技术架构设计

### 3.1 后端架构

```
┌─────────────────────────────────────────────────────────┐
│                     AI Chat Controller                   │
│  - 接收用户消息                                          │
│  - 调用意图识别服务                                       │
│  - 管理对话状态                                          │
│  - 调用各个功能模块                                       │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                Intent Recognition Service                │
│  - 使用LLM识别用户意图                                    │
│  - 提取关键参数                                          │
│  - 判断参数完整性                                        │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   Conversation Manager                   │
│  - 维护对话历史                                          │
│  - 管理当前对话状态                                      │
│  - 处理多轮对话                                          │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              Function Execution Layer                    │
│  - Topic Generator                                       │
│  - Content Generator                                     │
│  - Lexicon Optimizer                                    │
│  - Viral Replicator                                     │
└─────────────────────────────────────────────────────────┘
```

### 3.2 前端架构

```
┌─────────────────────────────────────────────────────────┐
│                     AI Chat Page                         │
│  - 消息列表展示                                          │
│  - 输入框                                                │
│  - 参数收集卡片                                          │
│  - 执行结果展示                                          │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   Chat Component                         │
│  - MessageList: 消息列表组件                            │
│  - MessageInput: 输入组件                               │
│  - ParameterCard: 参数收集卡片                          │
│  - ResultCard: 结果展示卡片                             │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  State Management                        │
│  - messages: 消息数组                                    │
│  - conversationState: 对话状态                          │
│  - pendingParams: 待收集参数                            │
│  - currentIntent: 当前意图                              │
└─────────────────────────────────────────────────────────┘
```

## 四、实现步骤

### Phase 1: 意图识别系统（后端）

#### 4.1.1 创建意图识别服务

**文件**: `server/src/ai-chat/intent-recognition.service.ts`

```typescript
interface Intent {
  type: 'quick_note' | 'topic_generation' | 'content_generation' | 'lexicon_optimize' | 'viral_replicate' | 'unknown';
  confidence: number;
  extractedParams: Record<string, any>;
  missingParams: string[];
}

@Injectable()
export class IntentRecognitionService {
  async recognizeIntent(userMessage: string, conversationHistory: Message[]): Promise<Intent> {
    // 调用LLM进行意图识别和参数提取
    const prompt = this.buildPrompt(userMessage, conversationHistory);
    const response = await this.llmService.chat(prompt);

    // 解析LLM响应
    const intent = this.parseIntent(response);

    return intent;
  }

  private buildPrompt(userMessage: string, conversationHistory: Message[]): string {
    return `
你是一个智能助手，需要识别用户的意图。支持的功能类型：

1. quick_note（灵感速记）：用户想要记录某个想法、笔记
2. topic_generation（选题生成）：用户想要生成选题、话题
3. content_generation（内容生成）：用户想要生成内容、脚本
4. lexicon_optimize（语料优化）：用户想要优化文本、去AI味
5. viral_replicate（爆款复刻）：用户想要分析爆款视频

用户消息：${userMessage}

对话历史：
${conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n')}

请以JSON格式返回：
{
  "type": "意图类型",
  "confidence": 0.9,
  "extractedParams": {},
  "missingParams": []
}
`;
  }
}
```

#### 4.1.2 创建AI Chat Controller

**文件**: `server/src/ai-chat/ai-chat.controller.ts`

```typescript
@Controller('ai-chat')
export class AiChatController {
  @Post('message')
  async handleMessage(@Body() body: { message: string; userId: string; conversationId: string }) {
    // 1. 获取对话历史
    const history = await this.conversationManager.getHistory(body.conversationId);

    // 2. 识别意图
    const intent = await this.intentRecognitionService.recognizeIntent(body.message, history);

    // 3. 根据意图处理
    if (intent.missingParams.length === 0) {
      // 参数完整，执行功能
      return await this.executeFunction(intent, body.userId);
    } else {
      // 参数缺失，收集参数
      return await this.collectParameters(intent);
    }
  }
}
```

### Phase 2: 对话管理系统（后端）

**文件**: `server/src/ai-chat/conversation-manager.service.ts`

```typescript
interface Conversation {
  id: string;
  userId: string;
  messages: Message[];
  currentIntent: Intent | null;
  collectedParams: Record<string, any>;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ConversationManagerService {
  async createConversation(userId: string): Promise<Conversation> {
    // 创建新对话
  }

  async addMessage(conversationId: string, role: 'user' | 'assistant', content: string): Promise<void> {
    // 添加消息到对话
  }

  async updateParams(conversationId: string, params: Record<string, any>): Promise<void> {
    // 更新已收集的参数
  }

  async getHistory(conversationId: string): Promise<Message[]> {
    // 获取对话历史
  }
}
```

### Phase 3: 前端实现

#### 4.3.1 创建AI助手页面

**文件**: `src/pages/ai-chat/index.tsx`

```typescript
export default function AiChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [pendingParams, setPendingParams] = useState<Params | null>(null);
  const [currentIntent, setCurrentIntent] = useState<Intent | null>(null);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    // 添加用户消息
    const userMessage: Message = {
      role: 'user',
      content: inputText,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMessage]);

    // 清空输入框
    setInputText('');

    // 发送消息到后端
    const response = await Network.request({
      url: '/api/ai-chat/message',
      method: 'POST',
      data: {
        message: inputText,
        userId: userId,
        conversationId: conversationId
      }
    });

    // 处理响应
    if (response.data.type === 'collect_params') {
      // 需要收集参数
      setPendingParams(response.data.params);
      setCurrentIntent(response.data.intent);
    } else if (response.data.type === 'execute') {
      // 执行功能
      showResult(response.data.result);
    } else {
      // 普通回复
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.data.message,
        timestamp: Date.now()
      }]);
    }
  };

  return (
    <View className="min-h-screen bg-slate-900 flex flex-col">
      {/* 消息列表 */}
      <View className="flex-1 overflow-y-auto p-4">
        {messages.map((msg, index) => (
          <MessageItem key={index} message={msg} />
        ))}

        {/* 参数收集卡片 */}
        {pendingParams && (
          <ParameterCard
            params={pendingParams}
            onSubmit={handleParamsSubmit}
          />
        )}
      </View>

      {/* 输入框 */}
      <View className="p-4 border-t border-slate-700">
        <MessageInput
          value={inputText}
          onChange={setInputText}
          onSend={handleSendMessage}
        />
      </View>
    </View>
  );
}
```

### Phase 4: 各功能模块集成

#### 4.4.1 灵感速记集成

```typescript
async function executeQuickNote(params: { content: string; tags?: string[] }) {
  // 调用现有的灵感速记接口
  const result = await Network.request({
    url: '/api/quick-notes',
    method: 'POST',
    data: params
  });
  return result;
}
```

#### 4.4.2 选题生成集成

```typescript
async function executeTopicGeneration(params: { platforms: string[]; inputSources?: any }) {
  // 调用现有的选题生成接口
  const result = await Network.request({
    url: '/api/topic-questions',
    method: 'POST',
    data: params
  });
  return result;
}
```

#### 4.4.3 内容生成集成

```typescript
async function executeContentGeneration(params: { topics: string[]; platforms: string[]; versions: number }) {
  // 调用现有的内容生成接口
  const result = await Network.request({
    url: '/api/content/generate',
    method: 'POST',
    data: params
  });
  return result;
}
```

#### 4.4.4 语料优化集成

```typescript
async function executeLexiconOptimize(params: { inputText: string; lexiconIds: string[] }) {
  // 调用现有的语料优化接口
  const result = await Network.request({
    url: '/api/lexicon/optimize',
    method: 'POST',
    data: params
  });
  return result;
}
```

#### 4.4.5 爆款复刻集成

```typescript
async function executeViralReplicate(params: { douyinUrl: string }) {
  // 调用现有的爆款复刻接口
  const result = await Network.request({
    url: '/api/viral/analyze',
    method: 'POST',
    data: params
  });
  return result;
}
```

## 五、数据库设计

### 5.1 对话表（conversations）

```sql
CREATE TABLE conversations (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  current_intent TEXT,
  collected_params JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 5.2 消息表（messages）

```sql
CREATE TABLE messages (
  id VARCHAR(36) PRIMARY KEY,
  conversation_id VARCHAR(36) NOT NULL,
  role ENUM('user', 'assistant', 'system') NOT NULL,
  content TEXT NOT NULL,
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);
```

## 六、UI/UX设计要点

### 6.1 消息样式

- **用户消息**：右侧气泡，蓝色背景
- **AI回复**：左侧气泡，深色背景
- **参数卡片**：居中卡片，带选项按钮
- **结果展示**：卡片形式，可展开/折叠

### 6.2 参数收集UI

```tsx
// 平台选择
<ParameterCard title="选择发布平台">
  <CheckboxGroup>
    <Checkbox value="douyin">抖音</Checkbox>
    <Checkbox value="xiaohongshu">小红书</Checkbox>
    <Checkbox value="shipinhao">视频号</Checkbox>
  </CheckboxGroup>
</ParameterCard>

// 选题选择
<ParameterCard title="选择选题">
  <List>
    {topics.map(topic => (
      <ListItem key={topic.id} selectable>
        {topic.title}
      </ListItem>
    ))}
  </List>
</ParameterCard>
```

### 6.3 交互反馈

- **输入状态**：显示"AI正在思考..."
- **加载状态**：显示加载动画
- **执行状态**：显示进度条
- **完成状态**：显示✅成功提示

## 七、上下文记忆策略

### 7.1 短期记忆
- 当前对话的所有消息
- 已收集的参数
- 当前正在执行的功能

### 7.2 长期记忆
- 用户常用设置（平台偏好）
- 历史功能使用记录
- 用户画像

### 7.3 上下文传递示例

```
用户: "生成3个选题"
AI: [生成选题] "已为您生成3个选题：1. xxx, 2. xxx, 3. xxx"
用户: "把第一个生成内容"
AI: [理解上下文：使用第一个选题] "好的，正在为《xxx》生成内容..."
```

## 八、优化方向

### 8.1 意图识别优化
- 增加训练样本
- 使用few-shot学习
- 添加意图置信度阈值

### 8.2 对话体验优化
- 支持快捷回复
- 添加表情包支持
- 支持语音输入

### 8.3 性能优化
- 意图识别结果缓存
- 对话历史分页加载
- 参数收集卡片预加载

## 九、测试计划

### 9.1 单元测试
- 意图识别服务
- 参数提取准确性
- 对话管理逻辑

### 9.2 集成测试
- 端到端对话流程
- 各功能模块集成
- 跨端兼容性

### 9.3 用户测试
- 对话自然度
- 参数收集体验
- 功能执行准确性

## 十、实施时间线

| 阶段 | 任务 | 预计时间 |
|-----|------|---------|
| Week 1 | 意图识别系统开发 | 3天 |
| Week 1 | 对话管理系统开发 | 2天 |
| Week 2 | 前端聊天界面开发 | 3天 |
| Week 2 | 参数收集界面开发 | 2天 |
| Week 3 | 功能模块集成 | 3天 |
| Week 3 | 数据库设计实现 | 2天 |
| Week 4 | 上下文记忆实现 | 2天 |
| Week 4 | 测试和优化 | 3天 |

## 十一、关键代码文件清单

### 后端
- `server/src/ai-chat/ai-chat.controller.ts`
- `server/src/ai-chat/ai-chat.service.ts`
- `server/src/ai-chat/intent-recognition.service.ts`
- `server/src/ai-chat/conversation-manager.service.ts`
- `server/src/ai-chat/function-executor.service.ts`
- `server/src/database/ai-chat/ai-chat.module.ts`

### 前端
- `src/pages/ai-chat/index.tsx`
- `src/pages/ai-chat/components/MessageList.tsx`
- `src/pages/ai-chat/components/MessageInput.tsx`
- `src/pages/ai-chat/components/ParameterCard.tsx`
- `src/pages/ai-chat/components/ResultCard.tsx`
- `src/pages/ai-chat/hooks/useConversation.ts`

### 数据库
- `server/src/database/migrations/create-conversations-table.ts`
- `server/src/database/migrations/create-messages-table.ts`

---

**下一步行动**：
1. 确认方案细节
2. 开始开发Phase 1（意图识别系统）
3. 逐步推进各个阶段的实现
