import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { DatabaseModule } from '../database/database.module';
import { StatisticsModule } from '../statistics/statistics.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [DatabaseModule, StatisticsModule, UserModule],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
