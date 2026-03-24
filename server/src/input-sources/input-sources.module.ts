import { Module } from '@nestjs/common';
import { InputSourcesController } from './input-sources.controller';

@Module({
  controllers: [InputSourcesController],
})
export class InputSourcesModule {}
