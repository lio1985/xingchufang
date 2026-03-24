import { Controller, Post, Body, Get } from '@nestjs/common';
import { ViralService } from './viral.service';

@Controller('viral')
export class ViralController {
  constructor(private readonly viralService: ViralService) {}

  @Post('extract')
  async extractVideo(@Body() body: { url: string }): Promise<{ code: number; msg: string; data: any }> {
    console.log('📥 [controller] 收到提取请求:', body);
    try {
      const result = await this.viralService.extractVideo(body.url);
      return { code: 200, msg: 'success', data: result };
    } catch (error) {
      return { code: 400, msg: error.message || '视频提取失败', data: null };
    }
  }

  @Post('transcribe')
  async transcribeAudio(@Body() body: { audioUrl: string }): Promise<{ code: number; msg: string; data: any }> {
    console.log('🎤 [controller] 收到语音识别请求:', body);
    try {
      const result = await this.viralService.transcribeAudio(body.audioUrl);
      return { code: 200, msg: 'success', data: result };
    } catch (error) {
      return { code: 400, msg: error.message || '语音识别失败', data: null };
    }
  }

  @Post('transcribe-base64')
  async transcribeAudioFromBase64(@Body() body: { base64Audio: string }): Promise<{ code: number; msg: string; data: any }> {
    console.log('🎤 [controller] 收到语音识别请求（Base64）');
    try {
      const result = await this.viralService.transcribeAudioFromBase64(body.base64Audio);
      return { code: 200, msg: 'success', data: result };
    } catch (error) {
      return { code: 400, msg: error.message || '语音识别失败', data: null };
    }
  }

  @Post('analyze')
  async analyzeContent(@Body() body: { transcript?: string; content?: string; platform?: string }): Promise<{ code: number; msg: string; data: any }> {
    const text = body.transcript || body.content || '';
    console.log('🔍 [controller] 收到分析请求:', { transcriptLength: text.length, platform: body.platform });
    if (!text) {
      return { code: 400, msg: '分析内容不能为空', data: null };
    }
    const result = await this.viralService.analyzeContent(text, body.platform || '通用');
    return { code: 200, msg: 'success', data: result };
  }

  @Post('favorite')
  async favoriteStructure(@Body() body: { title: string; structure: any; framework: any }): Promise<{ code: number; msg: string; data: any }> {
    console.log('❤️ [controller] 收到收藏请求:', { title: body.title });
    try {
      // TODO: 从请求头获取 userId
      const userId = undefined;
      const result = await this.viralService.favoriteFramework(userId, body.title, body.structure, body.framework);
      return { code: 200, msg: 'success', data: result };
    } catch (error) {
      console.error('❤️ [controller] 收藏失败:', error);
      return { code: 400, msg: error.message || '收藏失败', data: null };
    }
  }

  @Get('favorites')
  async getFavorites(): Promise<{ code: number; msg: string; data: any[] }> {
    console.log('📋 [controller] 收到获取收藏列表请求');
    try {
      // TODO: 从请求头获取 userId
      const userId = undefined;
      const result = await this.viralService.getFavorites(userId);
      return { code: 200, msg: 'success', data: result };
    } catch (error) {
      console.error('📋 [controller] 获取收藏列表失败:', error);
      return { code: 400, msg: error.message || '获取失败', data: [] };
    }
  }

  @Post('analyze-douyin')
  async analyzeDouyin(@Body() body: { url?: string; shareText?: string }): Promise<{ code: number; msg: string; data: any }> {
    const content = body.shareText || body.url || '';
    console.log('📥 [controller] 收到抖音内容分析请求:', { shareText: content.substring(0, 100) });
    if (!content) {
      return { code: 400, msg: '分享内容不能为空', data: null };
    }
    try {
      const result = await this.viralService.analyzeDouyinContent(content);
      return { code: 200, msg: 'success', data: result };
    } catch (error) {
      console.error('抖音内容分析失败:', error);
      return { code: 400, msg: error.message || '分析失败', data: null };
    }
  }

  @Post('remix')
  async remixContent(@Body() body: {
    transcript: string
    structure: any
    framework: any
    remixIdea: string
    lexiconContents: string
    style?: 'douyin' | 'xiaohongshu' | 'shipinhao' | 'gongzhonghao' | 'pyq'
  }): Promise<{ code: number; msg: string; data: any }> {
    console.log('🚀 [controller] 收到二创改写请求:', {
      transcriptLength: body.transcript?.length,
      frameworkType: body.framework?.type,
      ideaLength: body.remixIdea?.length,
      lexiconContentLength: body.lexiconContents?.length,
      style: body.style
    });
    try {
      const result = await this.viralService.remixContent(body);
      return { code: 200, msg: 'success', data: result };
    } catch (error) {
      console.error('🚀 [controller] 二创改写失败:', error);
      return { code: 400, msg: error.message || '改写失败', data: null };
    }
  }

  @Post('optimize-idea')
  async optimizeIdea(@Body() body: {
    idea: string
    transcript?: string
    style?: 'douyin' | 'xiaohongshu' | 'shipinhao' | 'gongzhonghao' | 'pyq'
  }): Promise<{ code: number; msg: string; data: any }> {
    console.log('🪄 [controller] 收到优化改写想法请求:', {
      ideaLength: body.idea?.length,
      transcriptLength: body.transcript?.length,
      style: body.style
    });
    try {
      const result = await this.viralService.optimizeIdea(body.idea, body.transcript, body.style);
      return { code: 200, msg: 'success', data: result };
    } catch (error) {
      console.error('🪄 [controller] 优化改写想法失败:', error);
      return { code: 400, msg: error.message || '优化失败', data: null };
    }
  }
}
