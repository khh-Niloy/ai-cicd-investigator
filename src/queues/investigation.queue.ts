import { Queue } from 'bullmq';

export const INVESTIGATION_QUEUE_NAME = 'workflow-investigation';

export interface InvestigationJobData {
  owner: string;
  repo: string;
  runId: string;
  workflowName?: string;
}

export type InvestigationQueue = Queue<InvestigationJobData>;
