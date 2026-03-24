import { Module } from '@nestjs/common';
import { EquipmentOrderController } from './equipment-order.controller';
import { EquipmentOrderService } from './equipment-order.service';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [NotificationModule],
  controllers: [EquipmentOrderController],
  providers: [EquipmentOrderService],
  exports: [EquipmentOrderService],
})
export class EquipmentOrderModule {}
