import { Module } from '@nestjs/common';
import { ImageAnalysisController } from './image-analysis.controller';

@Module({
  controllers: [ImageAnalysisController],
})
export class ImageAnalysisModule {}
