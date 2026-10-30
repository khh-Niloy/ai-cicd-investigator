import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { INVESTIGATION_QUEUE_NAME } from './investigation.queue';

@Module({
  imports: [
    BullModule.registerQueue({
      name: INVESTIGATION_QUEUE_NAME,
    }),
  ],
  exports: [BullModule],
})
export class QueuesModule {}
