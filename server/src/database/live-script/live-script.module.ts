import { Module } from '@nestjs/common'
import { LiveScriptController } from './live-script.controller'
import { LiveScriptService } from './live-script.service'

@Module({
  controllers: [LiveScriptController],
  providers: [LiveScriptService],
  exports: [LiveScriptService]
})
export class LiveScriptModule {}
