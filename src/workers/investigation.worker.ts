import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import {
  INVESTIGATION_QUEUE_NAME,
  InvestigationJobData,
} from '../queues/investigation.queue';

@Processor(INVESTIGATION_QUEUE_NAME)
export class InvestigationWorker extends WorkerHost {
  private readonly logger = new Logger(InvestigationWorker.name);

  constructor(private readonly aiService: AiService) {
    super();
  }

  async process(job: Job<InvestigationJobData>): Promise<any> {
    const { owner, repo, runId, workflowName } = job.data;
    this.logger.log(
      `[Queue Worker] Processing investigation job #${job.id} for ${owner}/${repo} run #${runId} (${workflowName || 'workflow'})`,
    );

    try {
      const result = await this.aiService.aiInvestigator(
        owner,
        repo,
        String(runId),
      );
      this.logger.log(
        `[Queue Worker] Completed investigation job #${job.id} for run #${runId}`,
      );
      return result;
    } catch (error: any) {
      this.logger.error(
        `[Queue Worker] Investigation job #${job.id} failed for run #${runId}: ${error?.message || error}`,
      );
      throw error;
    }
  }
}
