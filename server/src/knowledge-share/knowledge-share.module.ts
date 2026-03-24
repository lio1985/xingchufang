import { Module } from '@nestjs/common';
import { KnowledgeShareService } from './knowledge-share.service';
import { KnowledgeShareController } from './knowledge-share.controller';
import { UserModule } from '../user/user.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [UserModule, StorageModule],
  controllers: [KnowledgeShareController],
  providers: [KnowledgeShareService],
  exports: [KnowledgeShareService],
})
export class KnowledgeShareModule {}
