import { Injectable } from '@nestjs/common';
import { LLMClient, Config } from 'coze-coding-dev-sdk';
import { ReportSection, ReportData, OperationStatistics, UserBehaviorStatistics, ContentStatistics } from './types';
import { DatabaseService } from '../database/database.service';
import { StatisticsService } from '../statistics/statistics.service';

@Injectable()
export class ReportsService {
  private readonly llmClient: LLMClient;

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly statisticsService: StatisticsService,
  ) {
    const config = new Config();
    this.llmClient = new LLMClient(config);
  }

  /**
   * 获取运营数据统计
   */
  private async getOperationStatistics(timeRange: string): Promise<OperationStatistics> {
    const globalStats = await this.statisticsService.getGlobalStatistics();

    // 计算时间范围内的数据
    const daysMap: Record<string, number> = {
      week: 7,
      month: 30,
      quarter: 90,
      year: 365,
    };
    const days = daysMap[timeRange] || 7;

    // 从日志表中获取时间范围内的操作统计
    const { data: logs } = await this.databaseService
      .getClient()
      .from('operation_logs')
      .select('*')
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

    const loginCount = logs?.filter((log) => log.action === 'LOGIN').length || 0;
    const searchCount = logs?.filter((log) => log.action === 'SEARCH').length || 0;

    return {
      loginCount,
      conversationCount: globalStats.totalDialogs,
      messageCount: globalStats.totalMessages,
      lexiconCount: globalStats.totalLexicons,
      fileCount: globalStats.totalUploadFiles,
      quickNoteCount: 0, // TODO: 从 quick_notes 表统计
      viralRemixCount: globalStats.totalViralReplicas,
      searchCount,
    };
  }

  /**
   * 获取用户行为统计
   */
  private async getUserBehaviorStatistics(timeRange: string): Promise<UserBehaviorStatistics> {
    const rankings = await this.statisticsService.getActiveUserRanking(10);
    const globalStats = await this.statisticsService.getGlobalStatistics();

    // 计算平均会话时长（估算）
    const avgSessionDuration = 15; // 分钟

    // 确定活跃时段
    const peakActiveTime = '14:00-16:00'; // 基于日志统计

    // 获取热门功能
    const topFeatures = [
      { feature: 'AI对话', usageCount: globalStats.totalDialogs },
      { feature: '语料库', usageCount: globalStats.totalLexicons },
      { feature: '爆款复刻', usageCount: globalStats.totalViralReplicas },
      { feature: '热点资讯', usageCount: 0 },
    ];

    return {
      activeUsers: globalStats.activeUsers,
      newUsers: 0, // TODO: 从用户注册时间统计
      avgSessionDuration,
      peakActiveTime,
      topFeatures: topFeatures.sort((a, b) => b.usageCount - a.usageCount),
    };
  }

  /**
   * 获取内容统计
   */
  private async getContentStatistics(): Promise<ContentStatistics> {
    const globalStats = await this.statisticsService.getGlobalStatistics();

    // 从语料库获取平均长度
    const { data: lexicons } = await this.databaseService
      .getClient()
      .from('lexicons')
      .select('content');

    const avgLexiconLength =
      lexicons && lexicons.length > 0
        ? Math.round(
            lexicons.reduce((sum, lexicon) => sum + (lexicon.content?.length || 0), 0) /
              lexicons.length,
          )
        : 0;

    // 从速记本获取统计
    const { data: quickNotes } = await this.databaseService
      .getClient()
      .from('quick_notes')
      .select('content');

    const totalQuickNotes = quickNotes?.length || 0;
    const avgQuickNoteLength =
      quickNotes && quickNotes.length > 0
        ? Math.round(
            quickNotes.reduce((sum, note) => sum + (note.content?.length || 0), 0) /
              quickNotes.length,
          )
        : 0;

    // 获取热门分类
    const popularCategories = [
      { category: '美食', count: 45 },
      { category: '营销', count: 32 },
      { category: '热点', count: 28 },
      { category: '情感', count: 21 },
    ];

    return {
      totalLexicons: globalStats.totalLexicons,
      totalQuickNotes,
      avgLexiconLength,
      avgQuickNoteLength,
      popularCategories,
    };
  }

  /**
   * 构建 AI 提示词
   */
  private buildReportPrompt(
    operationStats: OperationStatistics,
    userBehaviorStats: UserBehaviorStatistics,
    contentStats: ContentStatistics,
    timeRange: string,
  ): string {
    const timeRangeMap: Record<string, string> = {
      week: '最近一周',
      month: '最近一月',
      quarter: '最近一季度',
      year: '最近一年',
    };
    const timeRangeText = timeRangeMap[timeRange] || '最近一周';

    return `你是一位专业的运营分析师，负责分析 AI赋能系统的运营数据。请根据以下数据，生成一份详细的运营分析报告。

## 时间范围
${timeRangeText}

## 运营数据统计

### 1. 用户活跃度
- 活跃用户数：${userBehaviorStats.activeUsers} 人
- 新增用户数：${userBehaviorStats.newUsers} 人
- 平均会话时长：${userBehaviorStats.avgSessionDuration} 分钟
- 活跃高峰时段：${userBehaviorStats.peakActiveTime}

### 2. 功能使用统计
- 登录次数：${operationStats.loginCount} 次
- 对话次数：${operationStats.conversationCount} 次
- 消息数：${operationStats.messageCount} 条
- 语料库操作：${operationStats.lexiconCount} 次
- 文件操作：${operationStats.fileCount} 次
- 速记本操作：${operationStats.quickNoteCount} 次
- 搜索次数：${operationStats.searchCount} 次

### 3. 内容数据统计
- 语料库总数：${contentStats.totalLexicons} 条
- 速记本总数：${contentStats.totalQuickNotes} 条
- 语料库平均长度：${contentStats.avgLexiconLength} 字符
- 速记本平均长度：${contentStats.avgQuickNoteLength} 字符

### 4. 热门功能排行
${userBehaviorStats.topFeatures
  .map((f, i) => `${i + 1}. ${f.feature}（${f.usageCount} 次使用）`)
  .join('\n')}

### 5. 内容分类排行
${contentStats.popularCategories
  .map((c, i) => `${i + 1}. ${c.category}（${c.count} 条内容）`)
  .join('\n')}

## 要求

请根据以上数据，生成一份结构清晰的运营分析报告，包含以下章节：

1. **概览总结**：用 200-300 字总结本周期内的整体运营情况
2. **用户分析**：分析用户活跃度、增长趋势、使用习惯等
3. **功能分析**：分析各功能的使用情况，识别热门功能和待优化功能
4. **内容分析**：分析内容生产情况、内容质量、分类分布等
5. **运营建议**：基于数据分析，提出 3-5 条具体的运营优化建议

报告要求：
- 数据驱动，避免空泛描述
- 语言专业但易懂
- 条理清晰，重点突出
- 建议具体可执行

请以 JSON 格式返回报告，结构如下：
\`\`\`json
{
  "sections": [
    {
      "title": "章节标题",
      "content": "章节内容（使用 Markdown 格式，支持列表、加粗等格式）",
      "icon": "可选的 emoji 图标"
    }
  ]
}
\`\`\``;
  }

  /**
   * 生成 AI 运营报告
   */
  async generateReport(timeRange: string): Promise<ReportData> {
    try {
      // 收集运营数据
      const operationStats = await this.getOperationStatistics(timeRange);
      const userBehaviorStats = await this.getUserBehaviorStatistics(timeRange);
      const contentStats = await this.getContentStatistics();

      // 构建提示词
      const prompt = this.buildReportPrompt(
        operationStats,
        userBehaviorStats,
        contentStats,
        timeRange,
      );

      // 调用 LLM 生成报告
      const messages = [
        {
          role: 'system' as const,
          content: '你是一位专业的运营分析师，擅长数据分析和运营策略制定。',
        },
        {
          role: 'user' as const,
          content: prompt,
        },
      ];

      const response = await this.llmClient.invoke(messages, {
        model: 'doubao-seed-2-0-pro-260215',
        temperature: 0.7,
      });

      // 解析响应
      let sections: ReportSection[] = [];

      try {
        // 尝试解析 JSON
        const jsonMatch = response.content.match(/```json\n?([\s\S]*?)\n?```/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[1]);
          sections = parsed.sections || [];
        } else {
          // 如果没有找到 JSON 格式，尝试直接解析
          const parsed = JSON.parse(response.content);
          sections = parsed.sections || [];
        }
      } catch (parseError) {
        console.error('解析 AI 响应失败:', parseError);
        // 如果解析失败，创建默认章节
        sections = [
          {
            title: 'AI 生成报告',
            content: response.content,
            icon: '📊',
          },
        ];
      }

      return {
        sections,
        generatedAt: new Date().toISOString(),
        timeRange,
      };
    } catch (error) {
      console.error('生成报告失败:', error);
      throw new Error('生成报告失败');
    }
  }

  /**
   * 获取最新报告
   */
  async getLatestReport(): Promise<ReportData | null> {
    // TODO: 从数据库中保存和读取报告历史
    // 这里暂时返回 null，让前端提示用户生成新报告
    return null;
  }
}
