import { Controller, Post, Body } from '@nestjs/common';
import { FetchClient, Config } from 'coze-coding-dev-sdk';

@Controller('image-fetch')
export class ImageFetchController {

  @Post()
  async fetchImage(@Body() body: { url: string }) {
    const { url } = body;
    const config = new Config();
    const client = new FetchClient(config);

    try {
      const response = await client.fetch(url);
      return {
        code: 200,
        msg: 'success',
        data: response
      };
    } catch (error) {
      return {
        code: 500,
        msg: 'error',
        data: error.message
      };
    }
  }
}
