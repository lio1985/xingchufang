import { Module } from '@nestjs/common';
import { TopicQuestionsController } from './topic-questions.controller';

@Module({
  controllers: [TopicQuestionsController],
})
export class TopicQuestionsModule {}
