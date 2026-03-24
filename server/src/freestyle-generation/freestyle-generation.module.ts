import { Module } from '@nestjs/common';
import { FreestyleGenerationController } from './freestyle-generation.controller';
import { FreestyleGenerationService } from './freestyle-generation.service';

@Module({
  controllers: [FreestyleGenerationController],
  providers: [FreestyleGenerationService],
  exports: [FreestyleGenerationService],
})
export class FreestyleGenerationModule {}
