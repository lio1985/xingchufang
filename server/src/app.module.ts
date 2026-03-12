import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { ImageFetchModule } from './image-fetch/image-fetch.module';
import { ImageAnalysisModule } from './image-analysis/image-analysis.module';
import { TopicQuestionsModule } from './topic-questions/topic-questions.module';
import { InputSourcesModule } from './input-sources/input-sources.module';
import { HotTopicsModule } from './hot-topics/hot-topics.module';
import { HotTopicFavoritesModule } from './hot-topic-favorites/hot-topic-favorites.module';
import { AiAnalysisModule } from './ai-analysis/ai-analysis.module';
import { InspirationModule } from './inspiration/inspiration.module';
import { UploadModule } from './upload/upload.module';
import { UserModule } from './user/user.module';
import { NewsModule } from './news/news.module';
import { AiChatModule } from './ai-chat/ai-chat.module';
import { DatabaseModule } from './database/database.module';
import { ContentGenerationModule } from './content-generation/content-generation.module';
import { ContentRewriteModule } from './content-rewrite/content-rewrite.module';
import { FreestyleGenerationModule } from './freestyle-generation/freestyle-generation.module';
import { TagGenerationModule } from './tag-generation/tag-generation.module';
import { ViralModule } from './viral/viral.module';
import { MultimediaModule } from './multimedia/multimedia.module';
import { TasksModule } from './tasks/tasks.module';
import { AdminModule } from './admin/admin.module';
import { StatisticsModule } from './statistics/statistics.module';
import { AuditModule } from './audit/audit.module';
import { QuickNotesModule } from './quick-notes/quick-notes.module';
import { ReportsModule } from './reports/reports.module';
import { KnowledgeShareModule } from './knowledge-share/knowledge-share.module';
import { CustomerManagementModule } from './customer-management/customer-management.module';
import { RecycleManagementModule } from './recycle-management/recycle-management.module';
import { TeamModule } from './team/team.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: '/workspace/projects/dist-web',
      exclude: ['api/{*path}'],
    }),
    UserModule,
    AdminModule,
    StatisticsModule,
    AuditModule,
    ImageFetchModule,
    ImageAnalysisModule,
    TopicQuestionsModule,
    InputSourcesModule,
    HotTopicsModule,
    HotTopicFavoritesModule,
    AiAnalysisModule,
    InspirationModule,
    UploadModule,
    NewsModule,
    AiChatModule,
    DatabaseModule,
    ContentGenerationModule,
    ContentRewriteModule,
    FreestyleGenerationModule,
    TagGenerationModule,
    ViralModule,
    MultimediaModule,
    TasksModule,
    QuickNotesModule,
    ReportsModule,
    KnowledgeShareModule,
    CustomerManagementModule,
    RecycleManagementModule,
    TeamModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
