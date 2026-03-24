import { Module } from '@nestjs/common';
import { HotController } from './hot.controller';
import { HotService } from './hot.service';
import { HotTopicsModule } from '../hot-topics/hot-topics.module';

@Module({
  imports: [HotTopicsModule],
  controllers: [HotController],
  providers: [HotService],
  exports: [HotService]
})
export class HotModule {}
