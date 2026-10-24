import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { GithubService } from './github.service';
import { AiService } from '../ai/ai.service';

@Controller('github')
export class GithubController {
  constructor(
    private readonly githubService: GithubService,
    private readonly aiService: AiService,
  ) {}

  @Post('webhook')
  async handleGitHubWebhook(@Body() payload: any) {
    if (payload.action !== 'completed') {
      return { ignored: true, reason: 'Action not completed' };
    }

    const conclusion = payload.workflow_run?.conclusion;
    const runId = payload.workflow_run?.id;
    const [owner, repo] = payload.repository?.full_name?.split('/') || [];
    const workflowName = payload.workflow_run?.name;

    if (!owner || !repo || !runId) {
      return { ignored: true, reason: 'Missing owner, repo, or runId' };
    }

    if (conclusion === 'failure') {
      console.log(
        `[Webhook] Investigating failure for run #${runId} (${owner}/${repo})...`,
      );
      const res = await this.aiService.aiInvestigator(
        owner,
        repo,
        String(runId),
      );
      console.log(
        `[Webhook] Failure investigation completed for run #${runId}`,
      );
      return res;
    }

    if (conclusion === 'success') {
      console.log(
        `[Webhook] Saving success run #${runId} (${owner}/${repo})...`,
      );
      const summary = workflowName
        ? `Workflow "${workflowName}" completed successfully with all jobs passing.`
        : 'Workflow completed successfully with all jobs passing.';
      const res = await this.aiService.saveSuccessRun(
        owner,
        repo,
        String(runId),
        summary,
      );
      console.log(`[Webhook] Success run #${runId} saved`);
      return res;
    }

    return { ignored: true, reason: `Ignored conclusion: ${conclusion}` };
  }

  @Get('workflow-runs/:owner/:repo')
  async listWorkflowRuns(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Query('status') status?: string,
  ) {
    return this.githubService.listWorkflowRuns(owner, repo, status);
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

@Controller('repos')
export class GithubReposController {
  constructor(private readonly githubService: GithubService) {}

  @Post(':owner/:repo/actions/workflows/:workflow_id/dispatches')
  async dispatchWorkflow(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('workflow_id') workflow_id: string,
    @Body('ref') ref?: string,
  ) {
    return this.githubService.dispatchWorkflow(
      owner,
      repo,
      workflow_id,
      ref || 'main',
    );
  }
}
