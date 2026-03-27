import { Module } from '@nestjs/common';
import { QuickNotesController } from './quick-notes.controller';
import { QuickNotesService } from './quick-notes.service';

@Module({
  imports: [],
  controllers: [QuickNotesController],
  providers: [QuickNotesService],
  exports: [QuickNotesService],
})
export class QuickNotesModule {}
