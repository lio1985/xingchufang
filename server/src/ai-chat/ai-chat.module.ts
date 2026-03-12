import { Module } from '@nestjs/common';
import { AiChatController } from './ai-chat.controller';
import { AiChatService } from './ai-chat.service';
import { IntentRecognitionService } from './intent-recognition.service';
import { ConversationManagerService } from './conversation-manager.service';
import { FunctionExecutorService } from './function-executor.service';
import { ContentGenerationModule } from '../content-generation/content-generation.module';

@Module({
  imports: [ContentGenerationModule],
  controllers: [AiChatController],
  providers: [
    AiChatService,
    IntentRecognitionService,
    ConversationManagerService,
    FunctionExecutorService,
  ],
  exports: [
    AiChatService,
    IntentRecognitionService,
    ConversationManagerService,
    FunctionExecutorService,
  ],
})
export class AiChatModule {}

