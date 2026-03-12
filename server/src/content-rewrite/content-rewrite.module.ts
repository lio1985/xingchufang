import { Module } from '@nestjs/common';
import { ContentRewriteController } from './content-rewrite.controller';
import { ContentRewriteService } from './content-rewrite.service';

@Module({
  controllers: [ContentRewriteController],
  providers: [ContentRewriteService],
  exports: [ContentRewriteService],
})
export class ContentRewriteModule {}
