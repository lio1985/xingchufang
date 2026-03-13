import { Module } from '@nestjs/common';
import { LiveDataController } from './live-data.controller';
import { LiveDataService } from './live-data.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [LiveDataController],
  providers: [LiveDataService],
  exports: [LiveDataService],
})
export class LiveDataModule {}
