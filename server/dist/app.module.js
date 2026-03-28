"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const image_fetch_module_1 = require("./image-fetch/image-fetch.module");
const image_analysis_module_1 = require("./image-analysis/image-analysis.module");
const topic_questions_module_1 = require("./topic-questions/topic-questions.module");
const input_sources_module_1 = require("./input-sources/input-sources.module");
const ai_analysis_module_1 = require("./ai-analysis/ai-analysis.module");
const inspiration_module_1 = require("./inspiration/inspiration.module");
const upload_module_1 = require("./upload/upload.module");
const user_module_1 = require("./user/user.module");
const news_module_1 = require("./news/news.module");
const ai_chat_module_1 = require("./ai-chat/ai-chat.module");
const database_module_1 = require("./database/database.module");
const content_generation_module_1 = require("./content-generation/content-generation.module");
const content_rewrite_module_1 = require("./content-rewrite/content-rewrite.module");
const freestyle_generation_module_1 = require("./freestyle-generation/freestyle-generation.module");
const tag_generation_module_1 = require("./tag-generation/tag-generation.module");
const viral_module_1 = require("./viral/viral.module");
const multimedia_module_1 = require("./multimedia/multimedia.module");
const tasks_module_1 = require("./tasks/tasks.module");
const admin_module_1 = require("./admin/admin.module");
const statistics_module_1 = require("./statistics/statistics.module");
const audit_module_1 = require("./audit/audit.module");
const permission_module_1 = require("./permission/permission.module");
const quick_notes_module_1 = require("./quick-notes/quick-notes.module");
const reports_module_1 = require("./reports/reports.module");
const knowledge_share_module_1 = require("./knowledge-share/knowledge-share.module");
const customer_management_module_1 = require("./customer-management/customer-management.module");
const recycle_management_module_1 = require("./recycle-management/recycle-management.module");
const team_module_1 = require("./team/team.module");
const notification_module_1 = require("./notification/notification.module");
const live_data_module_1 = require("./live-data/live-data.module");
const equipment_orders_module_1 = require("./equipment-orders/equipment-orders.module");
const storage_module_1 = require("./storage/storage.module");
const ai_admin_module_1 = require("./ai-admin/ai-admin.module");
const knowledge_module_1 = require("./knowledge/knowledge.module");
const file_parser_module_1 = require("./file-parser/file-parser.module");
const course_module_1 = require("./course/course.module");
const topics_module_1 = require("./topics/topics.module");
const content_writing_module_1 = require("./content-writing/content-writing.module");
const subscribe_message_module_1 = require("./subscribe-message/subscribe-message.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            schedule_1.ScheduleModule.forRoot(),
            user_module_1.UserModule,
            admin_module_1.AdminModule,
            statistics_module_1.StatisticsModule,
            audit_module_1.AuditModule,
            permission_module_1.PermissionModule,
            image_fetch_module_1.ImageFetchModule,
            image_analysis_module_1.ImageAnalysisModule,
            topic_questions_module_1.TopicQuestionsModule,
            input_sources_module_1.InputSourcesModule,
            ai_analysis_module_1.AiAnalysisModule,
            inspiration_module_1.InspirationModule,
            upload_module_1.UploadModule,
            news_module_1.NewsModule,
            ai_chat_module_1.AiChatModule,
            database_module_1.DatabaseModule,
            content_generation_module_1.ContentGenerationModule,
            content_rewrite_module_1.ContentRewriteModule,
            freestyle_generation_module_1.FreestyleGenerationModule,
            tag_generation_module_1.TagGenerationModule,
            viral_module_1.ViralModule,
            multimedia_module_1.MultimediaModule,
            tasks_module_1.TasksModule,
            quick_notes_module_1.QuickNotesModule,
            reports_module_1.ReportsModule,
            knowledge_share_module_1.KnowledgeShareModule,
            customer_management_module_1.CustomerManagementModule,
            recycle_management_module_1.RecycleManagementModule,
            team_module_1.TeamModule,
            notification_module_1.NotificationModule,
            live_data_module_1.LiveDataModule,
            equipment_orders_module_1.EquipmentOrdersModule,
            storage_module_1.StorageModule,
            ai_admin_module_1.AiAdminModule,
            knowledge_module_1.KnowledgeModule,
            file_parser_module_1.FileParserModule,
            course_module_1.CourseModule,
            topics_module_1.TopicsModule,
            content_writing_module_1.ContentWritingModule,
            subscribe_message_module_1.SubscribeMessageModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map