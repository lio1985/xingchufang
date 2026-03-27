import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { join } from 'path';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { ImageFetchModule } from './image-fetch/image-fetch.module';
import { ImageAnalysisModule } from './image-analysis/image-analysis.module';
import { TopicQuestionsModule } from './topic-questions/topic-questions.module';
import { InputSourcesModule } from './input-sources/input-sources.module';
import { HotTopicsModule } from './hot-topics/hot-topics.module';
import { HotModule } from './hot/hot.module';
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
import { NotificationModule } from './notification/notification.module';
import { LiveDataModule } from './live-data/live-data.module';
import { EquipmentOrdersModule } from './equipment-orders/equipment-orders.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    // ServeStaticModule 已移至 main.ts 手动配置，确保 API 路由优先
    UserModule,
    AdminModule,
    StatisticsModule,
    AuditModule,
    ImageFetchModule,
    ImageAnalysisModule,
    TopicQuestionsModule,
    InputSourcesModule,
    HotTopicsModule,
    HotModule,
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
    NotificationModule,
    LiveDataModule,
    EquipmentOrdersModule,
    StorageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
