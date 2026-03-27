import { Module } from '@nestjs/common';
import { AiAdminController } from './ai-admin.controller';
import { AiAdminService } from './ai-admin.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [AiAdminController],
  providers: [AiAdminService],
  exports: [AiAdminService],
})
export class AiAdminModule {}
