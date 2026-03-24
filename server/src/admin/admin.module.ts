import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { DatabaseModule } from '../database/database.module';
import { UserModule } from '../user/user.module';
import { LexiconModule } from '../database/lexicon/lexicon.module';
import { DataExportModule } from '../data-export/data-export.module';
import { StatisticsModule } from '../statistics/statistics.module';
import { AdminKnowledgeShareController } from './admin-knowledge-share.controller';
import { AdminKnowledgeShareService } from './admin-knowledge-share.service';
import { AdminCustomerController } from './admin-customer.controller';
import { CustomerManagementModule } from '../customer-management/customer-management.module';

@Module({
  imports: [
    DatabaseModule,
    UserModule,
    LexiconModule,
    DataExportModule,
    CustomerManagementModule,
    StatisticsModule,
  ],
  controllers: [AdminController, AdminKnowledgeShareController, AdminCustomerController],
  providers: [AdminService, AdminKnowledgeShareService],
})
export class AdminModule {}
