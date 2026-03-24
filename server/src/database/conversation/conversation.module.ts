import { Module } from '@nestjs/common';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';
import { UserModule } from '../../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [ConversationController],
  providers: [ConversationService],
})
export class ConversationModule {}
