import { Module } from '@nestjs/common';
import { LexiconController } from './lexicon.controller';
import { LexiconService } from './lexicon.service';
import { UserModule } from '../../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [LexiconController],
  providers: [LexiconService],
  exports: [LexiconService],
})
export class LexiconModule {}
