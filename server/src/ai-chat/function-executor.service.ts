import { Injectable, Inject } from '@nestjs/common';
import { Intent } from './intent-recognition.service';
import { ContentGenerationService } from '../content-generation/content-generation.service';

export interface FunctionResult {
  success: boolean;
  data?: any;
  error?: string;
  type: string;
}

@Injectable()
export class FunctionExecutorService {
  constructor(
    private readonly contentGenerationService: ContentGenerationService
  ) {}
  /**
   * 执行功能
   */
  async executeFunction(
    intent: Intent,
    params: Record<string, any>,
    userId: string
  ): Promise<FunctionResult> {
    console.log('=== 开始执行功能 ===');
    console.log('意图类型:', intent.type);
    console.log('参数:', params);

    try {
      let result: any;

      switch (intent.type) {
        case 'quick_note':
          result = await this.executeQuickNote(params);
          break;
        case 'topic_generation':
          result = await this.executeTopicGeneration(params);
          break;
        case 'content_generation':
          result = await this.executeContentGeneration(params);
          break;
        case 'lexicon_optimize':
          result = await this.executeLexiconOptimize(params);
          break;
        case 'viral_replicate':
          result = await this.executeViralReplicate(params);
          break;
        default:
          return {
            success: false,
            error: '未知的功能意图',
            type: intent.type,
          };
      }

      return {
        success: true,
        data: result,
        type: intent.type,
      };
    } catch (error: any) {
      console.error('执行功能失败:', error);
      return {
        success: false,
        error: error.message || '功能执行失败',
        type: intent.type,
      };
    }
  }

  /**
   * 执行灵感速记
   */
  private async executeQuickNote(params: Record<string, any>) {
    // 这里应该调用现有的灵感速记接口
    // 由于需要注入其他服务，暂时返回模拟数据
    console.log('执行灵感速记:', params);

    const content = params.content || '';

    return {
      id: crypto.randomUUID(),
      content: content,
      tags: params.tags || [],
      createdAt: new Date().toISOString(),
      message: '✅ 已记录您的灵感！',
    };
  }

  /**
   * 执行选题生成
   */
  private async executeTopicGeneration(params: Record<string, any>) {
    console.log('执行选题生成:', params);

    // 这里应该调用现有的选题生成接口
    // 返回模拟数据
    const platforms = params.platforms || ['douyin'];
    const category = params.category || '美食';
    const keywords = params.keywords || [];

    const topics = [
      { id: '1', title: `${category}：如何在家做出米其林级别的${keywords[0] || '牛排'}` },
      { id: '2', title: `${category}：10分钟快手${keywords[0] || '早餐'}，上班族必备！` },
      { id: '3', title: `${category}：3款低成本但高颜值的网红${keywords[0] || '甜点'}` },
      { id: '4', title: `${category}：揭秘${keywords[0] || '牛排'}的5个隐藏技巧` },
      { id: '5', title: `${category}：用${keywords[0] || '牛排'}做出餐厅级口感` },
    ];

    return {
      topics,
      platforms: platforms,
      message: `✨ 已为您生成${topics.length}个${category}！`,
    };
  }

  /**
   * 执行内容生成
   */
  private async executeContentGeneration(params: Record<string, any>) {
    console.log('执行内容生成:', params);

    // 确保 topics 是数组
    const topicsRaw = params.topics || [];
    const topics = Array.isArray(topicsRaw) ? topicsRaw : [topicsRaw];

    // 确保 platforms 是数组
    const platformsRaw = params.platforms || ['douyin'];
    const platforms = Array.isArray(platformsRaw) ? platformsRaw : [platformsRaw];

    const versions = params.versions || 2;

    console.log(`开始生成内容: ${topics.length}个选题, ${platforms.join(', ')}, ${versions}个版本`);

    try {
      // 调用 ContentGenerationService 真正使用 AI 生成 AB 方案
      const generatedContents = await this.contentGenerationService.generateContent(
        topics,
        {
          platform: platforms.join(', '),
          style: '标准版',
          length: 'medium'
        }
      );

      console.log(`AI 生成完成，共生成 ${generatedContents.length} 个内容版本`);

      // 转换为前端需要的格式
      const results = generatedContents.map((content, index) => {
        const versionNum = Math.floor(index / 2) + 1;
        const variantIndex = index % 2;
        const platform = platforms[variantIndex % platforms.length];

        return {
          topic: content.topic,
          version: versionNum,
          platform: platform,
          variant: content.variant || 'A',
          title: content.title,
          content: content.content,
          id: content.id,
          createdAt: content.createdAt
        };
      });

      return {
        success: true,
        results,
        platforms: platforms,
        versions: versions,
        totalResults: results.length,
        message: `✨ 已为您生成${results.length}个内容版本（AI生成）！`,
      };
    } catch (error: any) {
      console.error('AI 内容生成失败:', error);

      // 降级：使用模板生成
      console.log('降级使用模板生成');
      const results: any[] = [];

      for (const topic of topics) {
        for (let i = 0; i < versions; i++) {
          results.push({
            topic: topic,
            version: i + 1,
            platform: platforms[i % platforms.length],
            content: `【版本${i + 1}】${topic}\n\n这里是根据您的选题生成的内容...\n\n适合在${platforms[i % platforms.length]}上发布。`,
          });
        }
      }

      return {
        success: false,
        results,
        platforms: platforms,
        versions,
        message: `⚠️ AI生成失败，已为您生成${results.length}个模板版本`,
        error: error.message
      };
    }
  }

  /**
   * 执行语料优化
   */
  private async executeLexiconOptimize(params: Record<string, any>) {
    console.log('执行语料优化:', params);

    // 这里应该调用现有的语料优化接口
    // 返回模拟数据
    const inputText = params.inputText || '';

    const optimizedText = inputText
      .replace(/很/g, '特别')
      .replace(/非常/g, '极其')
      .replace(/很/g, '超级');

    return {
      originalText: inputText,
      optimizedText: optimizedText,
      lexiconIds: params.lexiconIds || [],
      message: '✅ 语料优化完成！',
    };
  }

  /**
   * 执行爆款复刻
   */
  private async executeViralReplicate(params: Record<string, any>) {
    console.log('执行爆款复刻:', params);

    // 这里应该调用现有的爆款复刻接口
    // 返回模拟数据
    const douyinUrl = params.douyinUrl || '';

    return {
      url: douyinUrl,
      title: '爆款视频分析结果',
      analysis: {
        title: '视频标题',
        content: '视频内容摘要',
        hooks: ['黄金前3秒', '情感共鸣点'],
        structure: '视频结构分析',
      },
      message: '✨ 爆款分析完成！',
    };
  }
}
