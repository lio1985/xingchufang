import { Module } from '@nestjs/common';
import { SubscribeMessageController } from './subscribe-message.controller';
import { SubscribeMessageService } from './subscribe-message.service';

@Module({
  controllers: [SubscribeMessageController],
  providers: [SubscribeMessageService],
  exports: [SubscribeMessageService],
})
export class SubscribeMessageModule {}
