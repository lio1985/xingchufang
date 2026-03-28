import { Module, Global, forwardRef } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { StorageModule } from '../storage/storage.module';
import { NotificationModule } from '../notification/notification.module';

@Global()
@Module({
  imports: [StorageModule, forwardRef(() => NotificationModule)],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
