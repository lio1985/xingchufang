"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const coze_coding_dev_sdk_1 = require("coze-coding-dev-sdk");
const database_service_1 = require("../database/database.service");
const statistics_service_1 = require("../statistics/statistics.service");
let ReportsService = class ReportsService {
    constructor(databaseService, statisticsService) {
        this.databaseService = databaseService;
        this.statisticsService = statisticsService;
        const config = new coze_coding_dev_sdk_1.Config();
        this.llmClient = new coze_coding_dev_sdk_1.LLMClient(config);
    }
    async getOperationStatistics(timeRange) {
        const globalStats = await this.statisticsService.getGlobalStatistics();
        const daysMap = {
            week: 7,
            month: 30,
            quarter: 90,
            year: 365,
        };
        const days = daysMap[timeRange] || 7;
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
            quickNoteCount: 0,
            viralRemixCount: globalStats.totalViralReplicas,
            searchCount,
        };
    }
    async getUserBehaviorStatistics(timeRange) {
        const rankings = await this.statisticsService.getActiveUserRanking(10);
        const globalStats = await this.statisticsService.getGlobalStatistics();
        const avgSessionDuration = 15;
        const peakActiveTime = '14:00-16:00';
        const topFeatures = [
            { feature: 'AI对话', usageCount: globalStats.totalDialogs },
            { feature: '语料库', usageCount: globalStats.totalLexicons },
            { feature: '爆款复刻', usageCount: globalStats.totalViralReplicas },
            { feature: '热点资讯', usageCount: 0 },
        ];
        return {
            activeUsers: globalStats.activeUsers,
            newUsers: 0,
            avgSessionDuration,
            peakActiveTime,
            topFeatures: topFeatures.sort((a, b) => b.usageCount - a.usageCount),
        };
    }
    async getContentStatistics() {
        const globalStats = await this.statisticsService.getGlobalStatistics();
        const { data: lexicons } = await this.databaseService
            .getClient()
            .from('lexicons')
            .select('content');
        const avgLexiconLength = lexicons && lexicons.length > 0
            ? Math.round(lexicons.reduce((sum, lexicon) => sum + (lexicon.content?.length || 0), 0) /
                lexicons.length)
            : 0;
        const { data: quickNotes } = await this.databaseService
            .getClient()
            .from('quick_notes')
            .select('content');
        const totalQuickNotes = quickNotes?.length || 0;
        const avgQuickNoteLength = quickNotes && quickNotes.length > 0
            ? Math.round(quickNotes.reduce((sum, note) => sum + (note.content?.length || 0), 0) /
                quickNotes.length)
            : 0;
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
    buildReportPrompt(operationStats, userBehaviorStats, contentStats, timeRange) {
        const timeRangeMap = {
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
    async generateReport(timeRange) {
        try {
            const operationStats = await this.getOperationStatistics(timeRange);
            const userBehaviorStats = await this.getUserBehaviorStatistics(timeRange);
            const contentStats = await this.getContentStatistics();
            const prompt = this.buildReportPrompt(operationStats, userBehaviorStats, contentStats, timeRange);
            const messages = [
                {
                    role: 'system',
                    content: '你是一位专业的运营分析师，擅长数据分析和运营策略制定。',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ];
            const response = await this.llmClient.invoke(messages, {
                model: 'doubao-seed-2-0-pro-260215',
                temperature: 0.7,
            });
            let sections = [];
            try {
                const jsonMatch = response.content.match(/```json\n?([\s\S]*?)\n?```/);
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[1]);
                    sections = parsed.sections || [];
                }
                else {
                    const parsed = JSON.parse(response.content);
                    sections = parsed.sections || [];
                }
            }
            catch (parseError) {
                console.error('解析 AI 响应失败:', parseError);
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
        }
        catch (error) {
            console.error('生成报告失败:', error);
            throw new Error('生成报告失败');
        }
    }
    async getLatestReport() {
        return null;
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        statistics_service_1.StatisticsService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map