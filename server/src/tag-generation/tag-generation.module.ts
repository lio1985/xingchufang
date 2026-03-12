import { Module } from '@nestjs/common';
import { TagGenerationController } from './tag-generation.controller';
import { TagGenerationService } from './tag-generation.service';

@Module({
  controllers: [TagGenerationController],
  providers: [TagGenerationService],
  exports: [TagGenerationService]
})
export class TagGenerationModule {}
