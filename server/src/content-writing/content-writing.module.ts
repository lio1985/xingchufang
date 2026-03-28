import { Module } from '@nestjs/common';
import { ContentWritingController } from './content-writing.controller';
import { ContentWritingService } from './content-writing.service';

@Module({
  controllers: [ContentWritingController],
  providers: [ContentWritingService],
  exports: [ContentWritingService],
})
export class ContentWritingModule {}
