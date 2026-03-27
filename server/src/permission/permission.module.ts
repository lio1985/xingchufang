import { Module, Global } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { UserModule } from '../user/user.module';

@Global()
@Module({
  imports: [UserModule],
  providers: [PermissionService],
  exports: [PermissionService],
})
export class PermissionModule {}
