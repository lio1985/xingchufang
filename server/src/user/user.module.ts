import { Module, Global, forwardRef } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { StorageModule } from '../storage/storage.module';
import { NotificationModule } from '../notification/notification.module';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ActiveUserGuard } from '../guards/active-user.guard';
import { AdminGuard } from '../guards/admin.guard';
import { OptionalAuthGuard } from '../guards/optional-auth.guard';

@Global()
@Module({
  imports: [StorageModule, forwardRef(() => NotificationModule)],
  controllers: [UserController],
  providers: [UserService, JwtAuthGuard, ActiveUserGuard, AdminGuard, OptionalAuthGuard],
  exports: [UserService, JwtAuthGuard, ActiveUserGuard, AdminGuard, OptionalAuthGuard],
})
export class UserModule {}
