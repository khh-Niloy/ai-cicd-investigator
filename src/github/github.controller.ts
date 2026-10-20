import { Controller, Get, Param } from '@nestjs/common';
import { GithubService } from './github.service';

@Controller('github')
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  @Get('workflow-runs/:owner/:repo')
  async listWorkflowRuns(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    return this.githubService.listWorkflowRuns(owner, repo);
  }

  @Get('workflow-run/:owner/:repo/:run_id')
  async getSingleWorkflowRun(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('run_id') run_id: string,
  ) {
    return this.githubService.getSingleWorkflowRun(owner, repo, run_id);
  }

  @Get('workflow-run-jobs/:owner/:repo/:run_id')
  async getWorkflowRunJobs(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('run_id') run_id: string,
  ) {
    return this.githubService.getWorkflowRunJobs(owner, repo, run_id);
  }
}
