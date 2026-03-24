import { Injectable } from '@nestjs/common';

export interface FreestyleInput {
  text?: string;
  imageUrl?: string;
  style?: string;
  platform?: string;
}

export interface GeneratedContent {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'image' | 'mixed';
  platform?: string;
  style?: string;
  createdAt: Date;
}

@Injectable()
export class FreestyleGenerationService {

  /**
   * 自由创作生成
   */
  async generateFreestyle(input: FreestyleInput): Promise<GeneratedContent> {
    let content = '';

    // 如果有文字，基于文字生成
    if (input.text && input.text.trim()) {
      content = await this.generateFromText(input.text, input.style, input.platform);
    }
    // 如果有图片，基于图片生成
    else if (input.imageUrl) {
      content = await this.generateFromImage(input.imageUrl, input.style, input.platform);
    }
    // 都没有，返回默认内容
    else {
      content = '请输入文字或上传图片进行创作';
    }

    return {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: this.generateTitle(input.text || '自由创作'),
      content,
      type: input.text && input.imageUrl ? 'mixed' : input.text ? 'text' : 'image',
      platform: input.platform || '通用',
      style: input.style || '标准',
      createdAt: new Date()
    };
  }

  /**
   * 基于文字生成
   */
  private async generateFromText(text: string, style?: string, platform?: string): Promise<string> {
    // 这里应该调用 LLM 服务，暂时使用模拟生成
    const platformInfo = platform ? `【${platform}平台】` : '';
    const styleInfo = style ? `【${style}风格】` : '';

    return `${platformInfo}${styleInfo}

基于您的输入内容"${text.substring(0, 50)}..."，我为您生成了以下内容：

📝 核心观点
您的观点很有价值，我们可以从以下几个方面展开...

💡 创意延伸
1. 角度一：...
2. 角度二：...
3. 角度三：...

✨ 亮点提炼
• 亮点一
• 亮点二
• 亮点三

🎯 行动建议
1. 建议一
2. 建议二

💬 互动引导
"你觉得呢？欢迎在评论区分享你的看法！"`;
  }

  /**
   * 基于图片生成
   */
  private async generateFromImage(imageUrl: string, style?: string, platform?: string): Promise<string> {
    // 这里应该调用图像理解服务，暂时使用模拟生成
    const platformInfo = platform ? `【${platform}平台】` : '';
    const styleInfo = style ? `【${style}风格】` : '';

    return `${platformInfo}${styleInfo}

📸 基于上传的图片，我为您生成了以下内容：

🖼️ 图片描述
这张图片展现了...

💡 内容创作方向
1. 故事线：...
2. 情感点：...
3. 互动点：...

📝 推荐文案
"这张照片让我想到了..."

✨ 创意扩展
可以从以下角度继续创作：
• 角度一
• 角度二

🎯 使用建议
建议配合话题标签发布，提升曝光率！`;
  }

  /**
   * 生成标题
   */
  private generateTitle(text: string): string {
    const prefixes = ['创意分享', '灵感创作', '自由发挥', '原创内容'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];

    const shortText = text.length > 20 ? text.substring(0, 20) + '...' : text;

    return `${prefix}：${shortText}`;
  }
}
