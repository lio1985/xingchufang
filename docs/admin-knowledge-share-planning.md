# 知识分享管理功能规划

## 一、功能概述

为后台管理系统添加知识分享管理功能，使管理员能够查看、管理、统计知识分享内容，确保平台内容质量和安全性。

## 二、页面结构

### 1. 知识分享管理页面 (`/pages/admin/knowledge-share-manage`)

**功能模块**：

#### 1.1 列表展示
- **分页列表**：每页 20 条，支持滚动加载
- **显示字段**：
  - 知识分享标题
  - 作者信息（头像、昵称）
  - 分类标签
  - 状态标签（已发布/未发布）
  - 浏览量、点赞数
  - 创建时间
  - 附件数量

#### 1.2 搜索功能
- **关键词搜索**：搜索标题、内容、作者昵称
- **高级筛选**：
  - 按分类筛选
  - 按状态筛选（已发布/未发布）
  - 按作者筛选
  - 按时间范围筛选（今天/本周/本月/自定义）
  - 按附件类型筛选（有图片/有文件/有录音/无附件）

#### 1.3 排序功能
- 按创建时间排序（最新/最早）
- 按浏览量排序（最高/最低）
- 按点赞数排序（最高/最低）
- 按标题排序（A-Z / Z-A）

#### 1.4 详情查看
- 点击列表项跳转到详情页面
- 展示完整内容、附件、作者信息
- 显示统计数据（浏览量、点赞数、创建/更新时间）
- 显示操作日志

#### 1.5 管理操作
- **删除**：管理员可删除任何知识分享
  - 单个删除
  - 批量删除
  - 删除前二次确认
  - 删除后提示并刷新列表
- **审核发布**（可选）：
  - 审核通过（发布）
  - 审核拒绝（拒绝发布）
  - 添加拒绝理由
- **置顶**：将重要知识分享置顶显示
- **下架**：将已发布的内容下架

#### 1.6 批量操作
- **批量选择**：
  - 单选/全选
  - 显示已选择数量
- **批量删除**：删除选中的知识分享
- **批量审核**：批量通过/拒绝
- **批量导出**：导出选中内容为 Excel/CSV

#### 1.7 数据统计摘要
- 顶部统计卡片：
  - 总知识分享数
  - 已发布数
  - 未发布数
  - 本周新增数
  - 总浏览量
  - 总点赞数

---

### 2. 知识分享统计页面 (`/pages/admin/knowledge-share-stats`)

**功能模块**：

#### 2.1 核心统计卡片
- **总知识分享数**：系统中所有知识分享总数
- **已发布数**：已发布的知识分享数
- **未发布数**：草稿或未发布的知识分享数
- **本周新增数**：最近 7 天新增的知识分享数
- **总浏览量**：所有知识分享的总浏览量
- **总点赞数**：所有知识分享的总点赞数
- **活跃作者数**：最近 30 天发布过知识分享的作者数

#### 2.2 趋势分析
- **新增趋势**：
  - 最近 7 天新增知识分享趋势图
  - 最近 30 天新增知识分享趋势图
  - 折线图展示，显示每天新增数量

#### 2.3 分类统计
- **分类分布**：
  - 各分类的知识分享数量
  - 饼图或柱状图展示
  - 点击分类查看该分类详情

#### 2.4 内容质量分析
- **浏览量排行**：
  - Top 10 最受欢迎的知识分享
  - 显示标题、作者、浏览量、点赞数
  - 点击可查看详情
- **点赞数排行**：
  - Top 10 点赞最多的知识分享
  - 显示标题、作者、点赞数、浏览量
  - 点击可查看详情

#### 2.5 作者活跃度排行
- **活跃作者排行**：
  - Top 10 活跃作者
  - 显示作者头像、昵称、发布数、总浏览量、总点赞数
  - 点击可查看作者详情

#### 2.6 附件使用统计
- **附件类型分布**：
  - 有图片的知识分享数
  - 有文件的知识分享数
  - 有录音的知识分享数
  - 无附件的知识分享数
  - 饼图展示
- **附件数量分布**：
  - 1 个附件的知识分享数
  - 2-5 个附件的知识分享数
  - 6-10 个附件的知识分享数
  - 10+ 个附件的知识分享数

#### 2.7 时间分析
- **发布时间分布**：
  - 24 小时发布热度图
  - 一周各天发布数量
  - 展示用户活跃时段

#### 2.8 数据导出
- **导出统计数据**：
  - 导出为 Excel
  - 导出为 CSV
  - 选择导出时间范围

---

## 三、数据库设计

### 3.1 知识分享表 (`knowledge_shares`)
现有字段已包含：
- `id`, `user_id`, `title`, `content`, `category`, `tags`
- `view_count`, `like_count`, `is_published`
- `attachments` (JSONB)，`created_at`, `updated_at`

**新增字段（建议）**：
- `is_featured` (boolean, default false): 是否置顶
- `is_deleted` (boolean, default false): 是否已删除（软删除）
- `admin_note` (text): 管理员备注（如拒绝理由）
- `featured_at` (timestamp): 置顶时间

### 3.2 知识分享操作日志表（可选）
```sql
CREATE TABLE knowledge_share_operation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  knowledge_share_id UUID NOT NULL REFERENCES knowledge_shares(id),
  operator_id UUID REFERENCES users(id),
  operation_type VARCHAR(50) NOT NULL, -- delete, feature, review_approve, review_reject
  operation_details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 四、后端接口设计

### 4.1 知识分享管理接口

#### 4.1.1 获取知识分享列表（管理员）
```
GET /api/admin/knowledge-shares
Query Parameters:
  - page: number (页码，默认 1)
  - pageSize: number (每页数量，默认 20)
  - keyword: string (搜索关键词)
  - category: string (分类筛选)
  - status: 'published' | 'draft' (状态筛选)
  - authorId: string (作者 ID)
  - startDate: string (开始日期)
  - endDate: string (结束日期)
  - attachmentType: 'image' | 'file' | 'audio' | 'none' (附件类型筛选)
  - sortBy: 'createdAt' | 'viewCount' | 'likeCount' | 'title' (排序字段)
  - sortOrder: 'asc' | 'desc' (排序方向)

Response:
{
  code: 200,
  msg: 'success',
  data: {
    items: [
      {
        id: string,
        title: string,
        author: { id, nickname, avatar },
        category: string,
        tags: string[],
        isPublished: boolean,
        viewCount: number,
        likeCount: number,
        attachmentCount: number,
        createdAt: string,
        isFeatured: boolean
      }
    ],
    total: number,
    page: number,
    pageSize: number
  }
}
```

#### 4.1.2 删除知识分享（管理员）
```
DELETE /api/admin/knowledge-shares/:id
Response:
{
  code: 200,
  msg: '删除成功',
  data: null
}
```

#### 4.1.3 批量删除知识分享（管理员）
```
POST /api/admin/knowledge-shares/batch-delete
Body:
{
  ids: string[]
}
Response:
{
  code: 200,
  msg: `成功删除 ${count} 条知识分享`,
  data: {
    successCount: number,
    failedCount: number,
    failedIds: string[]
  }
}
```

#### 4.1.4 置顶/取消置顶（管理员）
```
POST /api/admin/knowledge-shares/:id/feature
Body:
{
  isFeatured: boolean
}
Response:
{
  code: 200,
  msg: '操作成功',
  data: null
}
```

#### 4.1.5 审核发布（管理员）
```
POST /api/admin/knowledge-shares/:id/review
Body:
{
  action: 'approve' | 'reject',
  reason?: string  // 拒绝理由
}
Response:
{
  code: 200,
  msg: '审核成功',
  data: null
}
```

#### 4.1.6 获取知识分享统计数据摘要
```
GET /api/admin/knowledge-shares/summary
Response:
{
  code: 200,
  msg: 'success',
  data: {
    totalCount: number,
    publishedCount: number,
    draftCount: number,
    weeklyNewCount: number,
    totalViewCount: number,
    totalLikeCount: number,
    activeAuthorCount: number
  }
}
```

### 4.2 知识分享统计接口

#### 4.2.1 获取综合统计数据
```
GET /api/admin/knowledge-shares/stats
Response:
{
  code: 200,
  msg: 'success',
  data: {
    totalCount: number,
    publishedCount: number,
    draftCount: number,
    weeklyNewCount: number,
    monthlyNewCount: number,
    totalViewCount: number,
    totalLikeCount: number,
    activeAuthorCount: number,
    categoryStats: {
      [category: string]: number
    },
    attachmentStats: {
      withImage: number,
      withFile: number,
      withAudio: number,
      noAttachment: number
    },
    attachmentCountStats: {
      '1': number,
      '2-5': number,
      '6-10': number,
      '10+': number
    }
  }
}
```

#### 4.2.2 获取趋势数据
```
GET /api/admin/knowledge-shares/trend
Query Parameters:
  - days: number (天数，默认 7)

Response:
{
  code: 200,
  msg: 'success',
  data: {
    daily: [
      {
        date: string,
        count: number
      }
    ],
    total: number
  }
}
```

#### 4.2.3 获取热门知识分享排行
```
GET /api/admin/knowledge-shares/top
Query Parameters:
  - type: 'view' | 'like' (排序类型)
  - limit: number (数量，默认 10)

Response:
{
  code: 200,
  msg: 'success',
  data: {
    items: [
      {
        id: string,
        title: string,
        author: { id, nickname, avatar },
        viewCount: number,
        likeCount: number,
        category: string,
        createdAt: string
      }
    ]
  }
}
```

#### 4.2.4 获取活跃作者排行
```
GET /api/admin/knowledge-shares/authors/top
Query Parameters:
  - limit: number (数量，默认 10)

Response:
{
  code: 200,
  msg: 'success',
  data: {
    items: [
      {
        id: string,
        nickname: string,
        avatar: string,
        shareCount: number,
        totalViewCount: number,
        totalLikeCount: number,
        lastActiveAt: string
      }
    ]
  }
}
```

#### 4.2.5 导出统计数据
```
POST /api/admin/knowledge-shares/export
Body:
{
  type: 'stats' | 'list',
  startDate?: string,
  endDate?: string,
  format: 'excel' | 'csv'
}
Response:
{
  code: 200,
  msg: '导出成功',
  data: {
    fileKey: string,
    fileUrl: string
  }
}
```

---

## 五、前端页面设计

### 5.1 管理页面 UI 布局

**顶部导航栏**：
- 左侧：返回按钮 + "知识分享管理" 标题
- 右侧：刷新按钮

**统计摘要区域**（可折叠）：
- 6 个统计卡片网格布局
- 支持折叠/展开

**筛选区域**（可折叠）：
- 搜索输入框
- 分类下拉选择
- 状态下拉选择
- 时间范围选择
- 附件类型选择
- 排序选择

**列表区域**：
- 搜索结果提示（"找到 X 条结果"）
- 批量操作栏（显示选中数量、批量删除按钮）
- 知识分享列表卡片
- 分页组件

**空状态**：
- 搜索无结果：显示提示和清空搜索按钮
- 无数据：显示提示和引导

### 5.2 统计页面 UI 布局

**顶部导航栏**：
- 左侧：返回按钮 + "知识分享统计" 标题
- 右侧：刷新按钮 + 导出按钮

**核心统计区域**：
- 7 个统计卡片网格布局（渐变色背景）

**趋势图表区域**：
- 标题 + 图表容器
- 时间范围选择（7天/30天）

**分类统计区域**：
- 分类分布饼图
- 分类列表（带数量和占比）

**内容质量分析区域**：
- 浏览量排行列表
- 点赞数排行列表

**作者活跃度排行区域**：
- Top 10 活跃作者列表

**附件使用统计区域**：
- 附件类型分布饼图
- 附件数量分布柱状图

**数据说明区域**：
- 统计指标说明

---

## 六、实现优先级

### Phase 1：核心功能（必须）
1. 知识分享管理页面
   - 列表展示
   - 搜索功能
   - 删除功能（单个/批量）
   - 统计摘要

2. 知识分享统计页面
   - 核心统计卡片
   - 分类统计
   - 热门排行

### Phase 2：高级功能（重要）
3. 管理页面
   - 高级筛选
   - 排序功能
   - 详情查看
   - 置顶功能

4. 统计页面
   - 趋势分析
   - 作者活跃度排行
   - 附件使用统计

### Phase 3：扩展功能（可选）
5. 管理页面
   - 审核发布功能
   - 批量导出

6. 统计页面
   - 时间分析
   - 数据导出

---

## 七、技术要点

### 7.1 权限控制
- 使用 `AdminGuard` 或 `ActiveUserGuard` 确保只有管理员可以访问
- 在 Controller 中验证用户角色

### 7.2 性能优化
- 列表使用分页，避免一次加载过多数据
- 统计数据使用缓存（Redis 或内存缓存）
- 图片使用懒加载

### 7.3 数据安全
- 删除操作前二次确认
- 记录管理操作日志
- 敏感数据加密

### 7.4 用户体验
- 加载状态提示
- 操作成功/失败反馈
- 空状态引导
- 错误提示友好

---

## 八、文件结构

```
src/pages/admin/knowledge-share-manage/
├── index.tsx          # 管理页面主文件
└── index.config.ts    # 页面配置

src/pages/admin/knowledge-share-stats/
├── index.tsx          # 统计页面主文件
└── index.config.ts    # 页面配置

server/src/admin/
├── knowledge-share.controller.ts  # 知识分享管理控制器
└── knowledge-share.service.ts     # 知识分享管理服务
```

---

## 九、后续扩展建议

1. **内容审核**：集成 AI 内容审核，自动检测违规内容
2. **推荐算法**：基于用户行为的智能推荐
3. **评论系统**：知识分享评论功能
4. **收藏功能**：用户收藏知识分享
5. **分享功能**：分享到社交媒体
6. **版本控制**：知识分享版本历史
7. **协作编辑**：多人协作编辑知识分享
8. **权限细化**：更细粒度的权限控制
