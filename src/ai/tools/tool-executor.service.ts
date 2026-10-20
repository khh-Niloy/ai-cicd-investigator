import { Injectable } from '@nestjs/common';
import { GithubService } from '../../github/github.service';

@Injectable()
export class ToolExecutorService {
  constructor(private readonly githubService: GithubService) {}

  async executeTool(name: string, args: Record<string, any>) {
    const { owner, repo, run_id, job_id } = args;

    switch (name) {
      case 'listWorkflowRuns':
        return this.githubService.listWorkflowRuns(owner, repo);

      case 'getSingleWorkflowRun':
        return this.githubService.getSingleWorkflowRun(owner, repo, run_id);

      case 'getWorkflowRunJobs':
        return this.githubService.getWorkflowRunJobs(owner, repo, run_id);

      case 'getFailedJobs':
        return this.githubService.getFailedJobs(owner, repo, run_id);

      case 'getSingleFailedJob':
        return this.githubService.getSingleFailedJob(owner, repo, job_id);

      case 'getJobLogs':
        return this.githubService.getJobLogs(owner, repo, job_id);

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }
}
