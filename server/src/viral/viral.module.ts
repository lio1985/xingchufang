import { Module } from '@nestjs/common';
import { ViralController } from './viral.controller';
import { ViralService } from './viral.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ViralController],
  providers: [ViralService],
  exports: [ViralService],
})
export class ViralModule {}
