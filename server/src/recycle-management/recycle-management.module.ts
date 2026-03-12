import { Module } from '@nestjs/common';
import { RecycleManagementController } from './recycle-management.controller';
import { RecycleManagementService } from './recycle-management.service';
import { DatabaseModule } from '../database/database.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [DatabaseModule, UserModule],
  controllers: [RecycleManagementController],
  providers: [RecycleManagementService],
  exports: [RecycleManagementService],
})
export class RecycleManagementModule {}
