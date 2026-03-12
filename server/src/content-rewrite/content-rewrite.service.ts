import { Injectable } from '@nestjs/common';

@Injectable()
export class ContentRewriteService {

  /**
   * AI 文案改写
   */
  async rewriteContent(originalContent: string, prompt: string): Promise<string> {
    // 这里应该调用 LLM 服务，暂时使用模拟改写
    const rewrittenContent = this.simulateRewrite(originalContent, prompt);

    return rewrittenContent;
  }

  /**
   * 模拟改写（实际应该调用 LLM）
   */
  private simulateRewrite(content: string, prompt: string): string {
    // 简单的改写逻辑（实际应该使用 LLM）
    let rewritten = content;

    // 根据 prompt 中的关键词进行简单的改写
    const lowerPrompt = prompt.toLowerCase();

    if (lowerPrompt.includes('专业') || lowerPrompt.includes('正式')) {
      rewritten = this.makeProfessional(content);
    } else if (lowerPrompt.includes('轻松') || lowerPrompt.includes('口语')) {
      rewritten = this.makeCasual(content);
    } else if (lowerPrompt.includes('幽默') || lowerPrompt.includes('有趣')) {
      rewritten = this.makeHumorous(content);
    } else if (lowerPrompt.includes('精简') || lowerPrompt.includes('简洁')) {
      rewritten = this.makeConcise(content);
    } else if (lowerPrompt.includes('长') || lowerPrompt.includes('扩展')) {
      rewritten = this.makeLonger(content);
    } else {
      // 默认改写：添加一些优化
      rewritten = this.makeDefault(content, prompt);
    }

    return rewritten;
  }

  /**
   * 专业版改写
   */
  private makeProfessional(content: string): string {
    return `【专业版】\n\n${content}\n\n💡 专业提示：建议在实际应用中，结合行业标准和最佳实践进行优化。`;
  }

  /**
   * 轻松版改写
   */
  private makeCasual(content: string): string {
    return `【轻松版】\n\n${content}\n\n🎉 轻松提示：保持亲和力，让内容更易理解和接受！`;
  }

  /**
   * 幽默版改写
   */
  private makeHumorous(content: string): string {
    return `【幽默版】\n\n${content}\n\n😄 幽默提示：适度的幽默可以增加内容的趣味性和传播力！`;
  }

  /**
   * 精简版改写
   */
  private makeConcise(content: string): string {
    const simplified = content
      .replace(/【.*?】/g, '')
      .replace(/🎯|📝|💡|🔥|💪|✅|❓|📖|🎭|✨|🎯|💎|🏆/g, '')
      .split('\n')
      .filter((line) => line.trim().length > 0)
      .slice(0, Math.ceil(content.split('\n').length / 2))
      .join('\n');

    return `【精简版】\n\n${simplified}`;
  }

  /**
   * 扩展版改写
   */
  private makeLonger(content: string): string {
    return `${content}\n\n💡 额外补充：在实际应用中，可以根据具体情况进行调整和优化，增加更多的细节说明和案例展示。`;
  }

  /**
   * 默认改写
   */
  private makeDefault(content: string, prompt: string): string {
    return `【根据您的需求改写】\n\n${content}\n\n💡 提示：您的改写需求是"${prompt}"，已根据您的需求进行了优化调整。`;
  }
}
