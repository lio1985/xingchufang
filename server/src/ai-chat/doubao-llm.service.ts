import { Injectable } from '@nestjs/common';
import axios from 'axios';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

@Injectable()
export class DoubaoLLMService {
  private readonly apiKey = process.env.DOUBAO_API_KEY || 'b01b6e17-95c5-4e3a-b6bf-4bc5b6872f73';
  private readonly apiUrl = process.env.DOUBAO_API_URL || 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
  private readonly endpointId = process.env.DOUBAO_ENDPOINT_ID || 'ep-20260330092928-8pdcz';

  constructor() {
    console.log('=== DoubaoLLM: 初始化 ===');
    console.log('API URL:', this.apiUrl);
    console.log('接入点 ID:', this.endpointId);
    console.log('API Key 前8位:', this.apiKey?.substring(0, 8) + '...');
  }

  /**
   * 调用豆包 API 进行对话
   */
  async invoke(
    messages: ChatMessage[],
    options?: {
      temperature?: number;
      max_tokens?: number;
    }
  ): Promise<LLMResponse> {
    console.log('=== DoubaoLLM: 调用 API ===');
    console.log('消息数量:', messages.length);
    console.log('使用模型(接入点ID):', this.endpointId);

    const requestBody = {
      model: this.endpointId,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.max_tokens ?? 2000,
    };

    console.log('请求体:', JSON.stringify(requestBody, null, 2));

    try {
      const startTime = Date.now();
      
      const response = await axios.post(this.apiUrl, requestBody, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 60000, // 60秒超时
      });

      const elapsed = Date.now() - startTime;
      console.log('=== DoubaoLLM: API 响应成功 ===');
      console.log('耗时:', elapsed, 'ms');

      const data = response.data;
      const content = data.choices?.[0]?.message?.content || '';

      console.log('响应内容长度:', content.length);
      console.log('Token 使用:', data.usage);

      return {
        content,
        usage: data.usage,
      };
    } catch (error: any) {
      console.error('=== DoubaoLLM: API 调用失败 ===');
      console.error('错误信息:', error.message);
      if (error.response) {
        console.error('响应状态:', error.response.status);
        console.error('响应数据:', JSON.stringify(error.response.data, null, 2));
      }
      throw error;
    }
  }
}
