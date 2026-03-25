import { Module } from '@nestjs/common';
import { EquipmentOrdersController } from './equipment-orders.controller';
import { EquipmentOrdersService } from './equipment-orders.service';
import { NotificationModule } from '../notification/notification.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [NotificationModule, UserModule],
  controllers: [EquipmentOrdersController],
  providers: [EquipmentOrdersService],
  exports: [EquipmentOrdersService],
})
export class EquipmentOrdersModule {}
