import { Controller, Post, Body } from '@nestjs/common';
import { LLMClient, Config } from 'coze-coding-dev-sdk';

@Controller('image-analysis')
export class ImageAnalysisController {

  @Post()
  async analyzeImage(@Body() body: { imageUrl: string }) {
    const { imageUrl } = body;
    const config = new Config();
    const client = new LLMClient(config);

    try {
      const messages: any[] = [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: '请详细分析这张图片中的内容，特别是其中包含的规划、设计或需求信息。如果图片包含界面设计图、功能规划或项目需求，请详细描述所有可见的元素、文字、布局结构，以及这些元素之间的关系。'
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
                detail: 'high'
              }
            }
          ]
        }
      ];

      const response = await client.invoke(messages, {
        model: 'doubao-seed-1-6-vision-250815',
        temperature: 0.3
      });

      return {
        code: 200,
        msg: 'success',
        data: {
          analysis: response.content
        }
      };
    } catch (error) {
      console.error('Image analysis error:', error);
      return {
        code: 500,
        msg: 'error',
        data: {
          error: error.message,
          stack: error.stack
        }
      };
    }
  }
}
