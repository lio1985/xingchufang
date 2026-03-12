import { Controller, Post, Body, HttpException, HttpStatus, Get, Param } from '@nestjs/common';
import { AiChatService } from './ai-chat.service';

@Controller('ai-chat')
export class AiChatController {
  constructor(private readonly aiChatService: AiChatService) {}

  /**
   * 发送消息
   */
  @Post('message')
  async sendMessage(@Body() body: {
    message: string;
    userId: string;
    conversationId?: string;
    model?: string;
  }) {
    try {
      console.log('=== Controller: 接收消息请求 ===');
      console.log('Message:', body.message);
      console.log('UserId:', body.userId);
      console.log('ConversationId:', body.conversationId);

      if (!body.message || !body.userId) {
        throw new HttpException(
          '消息和用户ID不能为空',
          HttpStatus.BAD_REQUEST
        );
      }

      const response = await this.aiChatService.handleMessage({
        message: body.message,
        userId: body.userId,
        conversationId: body.conversationId,
        model: body.model || 'doubao-seed-1-8-251228',
      });

      console.log('=== Controller: 返回响应 ===');
      console.log('Response type:', response.type);

      return {
        code: 200,
        msg: 'success',
        data: response,
      };
    } catch (error: any) {
      console.error('Controller: 处理消息失败:', error);
      throw new HttpException(
        error.message || '处理消息失败',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 提交参数
   */
  @Post('submit-params')
  async submitParams(@Body() body: {
    conversationId: string;
    params: Record<string, any>;
  }) {
    try {
      console.log('=== Controller: 接收参数提交 ===');
      console.log('ConversationId:', body.conversationId);
      console.log('Params:', body.params);

      if (!body.conversationId || !body.params) {
        throw new HttpException(
          '对话ID和参数不能为空',
          HttpStatus.BAD_REQUEST
        );
      }

      const response = await this.aiChatService.submitParams(
        body.conversationId,
        body.params
      );

      console.log('=== Controller: 返回参数提交响应 ===');
      console.log('Response type:', response.type);

      return {
        code: 200,
        msg: 'success',
        data: response,
      };
    } catch (error: any) {
      console.error('Controller: 提交参数失败:', error);
      throw new HttpException(
        error.message || '提交参数失败',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 获取对话历史
   */
  @Get('history/:conversationId')
  async getHistory(@Param('conversationId') conversationId: string) {
    try {
      console.log('=== Controller: 获取对话历史 ===');
      console.log('ConversationId:', conversationId);

      const history = await this.aiChatService.getHistory(conversationId);

      console.log('=== Controller: 返回对话历史 ===');
      console.log('History length:', history.length);

      return {
        code: 200,
        msg: 'success',
        data: {
          history,
        },
      };
    } catch (error: any) {
      console.error('Controller: 获取对话历史失败:', error);
      throw new HttpException(
        error.message || '获取对话历史失败',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 完成对话
   */
  @Post('complete/:conversationId')
  async completeConversation(@Param('conversationId') conversationId: string) {
    try {
      console.log('=== Controller: 完成对话 ===');
      console.log('ConversationId:', conversationId);

      await this.aiChatService.completeConversation(conversationId);

      return {
        code: 200,
        msg: 'success',
        data: {
          message: '对话已完成',
        },
      };
    } catch (error: any) {
      console.error('Controller: 完成对话失败:', error);
      throw new HttpException(
        error.message || '完成对话失败',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 取消对话
   */
  @Post('cancel/:conversationId')
  async cancelConversation(@Param('conversationId') conversationId: string) {
    try {
      console.log('=== Controller: 取消对话 ===');
      console.log('ConversationId:', conversationId);

      await this.aiChatService.cancelConversation(conversationId);

      return {
        code: 200,
        msg: 'success',
        data: {
          message: '对话已取消',
        },
      };
    } catch (error: any) {
      console.error('Controller: 取消对话失败:', error);
      throw new HttpException(
        error.message || '取消对话失败',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 旧版接口（向后兼容）
   */
  @Post('chat')
  async chat(@Body() body: {
    message: string;
    model?: string;
    history?: Array<{ role: string; content: string }>;
  }) {
    try {
      console.log('=== Controller: 旧版对话接口 ===');

      const { message, model = 'doubao-seed-1-8-251228', history = [] } = body;

      if (!message) {
        throw new HttpException('消息不能为空', HttpStatus.BAD_REQUEST);
      }

      // 使用默认用户ID
      const response = await this.aiChatService.handleMessage({
        message,
        userId: 'default-user',
        model,
      });

      return {
        code: 200,
        msg: 'success',
        data: {
          content: response.message,
        },
      };
    } catch (error: any) {
      console.error('Controller: 旧版对话失败:', error);
      throw new HttpException(
        error.message || '对话失败',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
