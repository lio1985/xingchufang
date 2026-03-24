import { Module } from '@nestjs/common';
import { QuickNotesController } from './quick-notes.controller';
import { QuickNotesService } from './quick-notes.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [QuickNotesController],
  providers: [QuickNotesService],
  exports: [QuickNotesService],
})
export class QuickNotesModule {}
