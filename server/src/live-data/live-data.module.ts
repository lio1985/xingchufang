import { Module } from '@nestjs/common';
import { LiveDataController } from './live-data.controller';
import { LiveDataService } from './live-data.service';

@Module({
  controllers: [LiveDataController],
  providers: [LiveDataService],
  exports: [LiveDataService],
})
export class LiveDataModule {}
