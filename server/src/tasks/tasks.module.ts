import { Module } from '@nestjs/common';
import { ScheduledTaskService } from './scheduled-task.service';
import { ScheduledTaskController } from './scheduled-task.controller';
import { WorkPlanService } from './work-plan.service';
import { WorkPlanController } from './work-plan.controller';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [ScheduledTaskController, WorkPlanController],
  providers: [ScheduledTaskService, WorkPlanService],
  exports: [ScheduledTaskService, WorkPlanService],
})
export class TasksModule {}
