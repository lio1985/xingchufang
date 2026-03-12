import { Module } from '@nestjs/common';
import { CustomerManagementController } from './customer-management.controller';
import { CustomerManagementService } from './customer-management.service';
import { ChurnWarningController } from './churn-warning.controller';
import { ChurnWarningService } from './churn-warning.service';
import { SalesTargetController } from '../modules/customer/sales-target.controller';
import { SalesTargetService } from '../modules/customer/sales-target.service';
import { DatabaseModule } from '../database/database.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [DatabaseModule, UserModule],
  controllers: [CustomerManagementController, ChurnWarningController, SalesTargetController],
  providers: [CustomerManagementService, ChurnWarningService, SalesTargetService],
  exports: [CustomerManagementService, ChurnWarningService, SalesTargetService]
})
export class CustomerManagementModule {}
