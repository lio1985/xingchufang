import { Module } from '@nestjs/common';
import { AiAdminController } from './ai-admin.controller';
import { AiAdminService } from './ai-admin.service';

@Module({
  controllers: [AiAdminController],
  providers: [AiAdminService],
  exports: [AiAdminService],
})
export class AiAdminModule {}
