import { Module } from '@nestjs/common';
import { ImageFetchController } from './image-fetch.controller';

@Module({
  controllers: [ImageFetchController],
})
export class ImageFetchModule {}
