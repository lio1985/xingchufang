import { Controller, Post, Body } from '@nestjs/common';
import { AiAnalysisService, AnalysisResult, RecommendedTopic } from './ai-analysis.service';

@Controller('ai-analysis')
export class AiAnalysisController {
  constructor(private readonly aiAnalysisService: AiAnalysisService) {}

  @Post('analyze-questions')
  async analyzeQuestions(@Body() body: { questions: string[] }): Promise<{ code: number; msg: string; data: AnalysisResult }> {
    const result = await this.aiAnalysisService.analyzeQuestions(body.questions);
    return { code: 200, msg: 'success', data: result };
  }

  @Post('recommend-topics')
  async recommendTopics(@Body() body: {
    platforms: string[];
    questions: string[];
    hotTopics: any[];
    preferences?: {
      industries: string[];
      interests: string[];
      newsCategories: string[];
    };
  }): Promise<{ code: number; msg: string; data: RecommendedTopic[] }> {
    const result = await this.aiAnalysisService.recommendTopics(
      body.platforms,
      body.questions,
      body.hotTopics,
      body.preferences
    );
    return { code: 200, msg: 'success', data: result };
  }
}
