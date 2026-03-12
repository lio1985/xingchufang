import { Module } from '@nestjs/common';
import { HotTopicFavoritesController } from './hot-topic-favorites.controller';
import { HotTopicFavoritesService } from './hot-topic-favorites.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [HotTopicFavoritesController],
  providers: [HotTopicFavoritesService],
  exports: [HotTopicFavoritesService],
})
export class HotTopicFavoritesModule {}
