import { Injectable } from '@nestjs/common';
import { LLMClient, Config } from 'coze-coding-dev-sdk';

@Injectable()
export class TagGenerationService {
  private llmClient: LLMClient;

  constructor() {
    const config = new Config();
    this.llmClient = new LLMClient(config);
  }

  /**
   * AI 生成标签
   */
  async generateTags(content: string): Promise<string[]> {
    console.log('=== 开始生成标签 ===');
    console.log('Content length:', content.length);

    try {
      const prompt = `请分析以下内容，提取3-5个核心标签。

要求：
1. 标签应该简洁明了，用2-4个字表示
2. 标签应该准确反映内容的主题和关键词
3. 优先提取名词和关键概念
4. 避免重复和过于宽泛的标签
5. 只返回标签列表，用逗号分隔

内容：
${content.substring(0, 1000)}

标签：`;

      const response = await this.llmClient.invoke([
        {
          role: 'system',
          content: '你是一个专业的标签生成助手，擅长从文本中提取核心关键词和主题标签。'
        },
        {
          role: 'user',
          content: prompt
        }
      ], {
        model: 'doubao-seed-1-8-251228',
        temperature: 0.3,
        thinking: 'disabled',
        caching: 'disabled'
      });

      console.log('=== LLM Response ===');
      console.log('Tags response:', response.content?.substring(0, 200) || 'No content');

      // 解析响应，提取标签
      const tags = this.parseTags(response.content);

      console.log('Parsed tags:', tags);

      return tags;
    } catch (error) {
      console.error('LLM 生成标签失败:', error);

      // 降级方案：使用简单的关键词提取
      return this.extractFallbackTags(content);
    }
  }

  /**
   * 解析标签
   */
  private parseTags(response: string): string[] {
    if (!response) return [];

    // 移除可能的格式标记
    const cleaned = response
      .replace(/^.*?[:：]\s*/, '') // 移除开头的"标签："等前缀
      .replace(/[、\n\r]/g, ',')   // 将中文顿号和换行符替换为逗号
      .replace(/，/g, ',')          // 将中文逗号替换为英文逗号
      .replace(/#+/g, '')          // 移除井号
      .trim();

    // 分割并过滤
    const tags = cleaned
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0 && tag.length <= 10) // 过滤掉过长或为空的标签
      .slice(0, 5); // 最多返回5个标签

    return tags;
  }

  /**
   * 降级方案：简单的关键词提取
   */
  private extractFallbackTags(content: string): string[] {
    const keywords = [
      '灵感', '笔记', '创意', '想法', '计划',
      '工作', '学习', '生活', '思考', '总结',
      '心得', '经验', '技巧', '方法', '工具'
    ];

    const contentLower = content.toLowerCase();
    const matchedTags = keywords.filter(keyword => contentLower.includes(keyword));

    // 如果没有匹配到，返回默认标签
    return matchedTags.length > 0 ? matchedTags.slice(0, 3) : ['笔记'];
  }

  /**
   * AI 生成标题
   */
  async generateTitle(content: string): Promise<string> {
    console.log('=== 开始生成标题 ===');
    console.log('Content length:', content.length);

    try {
      const prompt = `请为以下内容生成一个简洁、吸引人的标题。

要求：
1. 标题长度控制在5-15个字
2. 标题应该准确反映内容的主题和重点
3. 标题应该简洁有力，避免过长
4. 使用吸引人的语言，增强可读性
5. 只返回标题，不需要其他说明

内容：
${content.substring(0, 800)}

标题：`;

      const response = await this.llmClient.invoke([
        {
          role: 'system',
          content: '你是一个专业的标题生成助手，擅长根据内容创作简洁、吸引人的标题。'
        },
        {
          role: 'user',
          content: prompt
        }
      ], {
        model: 'doubao-seed-1-8-251228',
        temperature: 0.4,
        thinking: 'disabled',
        caching: 'disabled'
      });

      console.log('=== LLM Response ===');
      console.log('Title response:', response.content?.substring(0, 100) || 'No content');

      // 解析响应，提取标题
      const title = this.parseTitle(response.content);

      console.log('Parsed title:', title);

      return title;
    } catch (error) {
      console.error('LLM 生成标题失败:', error);

      // 降级方案：使用内容前10个字作为标题
      return this.extractFallbackTitle(content);
    }
  }

  /**
   * 解析标题
   */
  private parseTitle(response: string): string {
    if (!response) return '';

    // 移除可能的格式标记和多余内容
    const cleaned = response
      .replace(/^.*?[:：]\s*/, '') // 移除开头的"标题："等前缀
      .replace(/[【】\[\]]/g, '')   // 移除方括号
      .replace(/《》/g, '')        // 移除书名号
      .replace(/^\d+[、.]\s*/, '') // 移除数字列表标记
      .trim();

    // 截取前15个字
    const title = cleaned.substring(0, 15);

    return title;
  }

  /**
   * 降级方案：简单的标题提取
   */
  private extractFallbackTitle(content: string): string {
    const fallbackTitle = content.trim().substring(0, 15);

    return fallbackTitle || '无标题笔记';
  }
}
