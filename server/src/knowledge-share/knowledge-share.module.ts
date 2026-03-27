import { Module } from '@nestjs/common';
import { KnowledgeShareService } from './knowledge-share.service';
import { KnowledgeShareController } from './knowledge-share.controller';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [StorageModule],
  controllers: [KnowledgeShareController],
  providers: [KnowledgeShareService],
  exports: [KnowledgeShareService],
})
export class KnowledgeShareModule {}
