import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { HotTopicsController } from './hot-topics.controller';
import { HotTopicsService } from './hot-topics.service';

@Module({
  imports: [HttpModule],
  controllers: [HotTopicsController],
  providers: [HotTopicsService],
  exports: [HotTopicsService],
})
export class HotTopicsModule {}
