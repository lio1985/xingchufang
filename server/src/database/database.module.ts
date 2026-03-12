import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { WelcomeModule } from './welcome/welcome.module';
import { ConversationModule } from './conversation/conversation.module';
import { LexiconModule } from './lexicon/lexicon.module';
import { ProductModule } from './product/product.module';
import { LiveScriptModule } from './live-script/live-script.module';

@Module({
  imports: [WelcomeModule, ConversationModule, LexiconModule, ProductModule, LiveScriptModule],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
