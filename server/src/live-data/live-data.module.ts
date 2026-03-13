import { Module } from '@nestjs/common';
import { LiveDataController } from './live-data.controller';
import { LiveDataService } from './live-data.service';
import { UserModule } from '../user/user.module';
import { ActiveUserGuard } from '../guards/active-user.guard';

@Module({
  imports: [UserModule],
  controllers: [LiveDataController],
  providers: [LiveDataService, ActiveUserGuard],
  exports: [LiveDataService],
})
export class LiveDataModule {}
