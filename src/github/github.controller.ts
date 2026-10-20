import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { GithubService } from './github.service';
import { AiService } from '../ai/ai.service';

@Controller('github')
export class GithubController {
  constructor(
    private readonly githubService: GithubService,
    private readonly aiService: AiService,
  ) {}

  @Post('webhook')
  handleGitHubWebhook(@Body() payload: any) {
    if (
      payload.action !== 'completed' ||
      payload.workflow_run?.conclusion !== 'failure'
    ) {
      return;
    }

    const runId = payload.workflow_run.id;
    const [owner, repo] = payload.repository.full_name.split('/');

    const res = this.aiService.aiInvestigator(owner, repo, String(runId));
    console.log(res);
  }

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

  @Get('failed-jobs/:owner/:repo/:run_id')
  async getFailedJobs(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('run_id') run_id: string,
  ) {
    return this.githubService.getFailedJobs(owner, repo, run_id);
  }

  @Get('single-failed-job/:owner/:repo/:job_id')
  async getSingleFailedJob(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('job_id') job_id: string,
  ) {
    return this.githubService.getSingleFailedJob(owner, repo, job_id);
  }

  @Get('get-job-logs/:owner/:repo/:job_id')
  async getJobLogs(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('job_id') job_id: string,
  ) {
    return this.githubService.getJobLogs(owner, repo, job_id);
  }
}
