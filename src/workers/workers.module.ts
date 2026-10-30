import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { QueuesModule } from '../queues/queues.module';
import { InvestigationWorker } from './investigation.worker';

@Module({
  imports: [AiModule, QueuesModule],
  providers: [InvestigationWorker],
  exports: [InvestigationWorker],
})
export class WorkersModule {}
