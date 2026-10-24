import { Injectable, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class GithubService {
  constructor() {}

  private getHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...additionalHeaders,
    };
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }
    return headers;
  }

  async listWorkflowRuns(owner: string, repo: string, status?: string) {
    const query = status && status !== 'all' ? `?status=${encodeURIComponent(status)}` : '';
    const url = `https://api.github.com/repos/${owner}/${repo}/actions/runs${query}`;
    const response = await fetch(url, {
      headers: this.getHeaders(),
    });
    return response.json();
  }

  async getSingleWorkflowRun(owner: string, repo: string, run_id: string) {
    const url = `https://api.github.com/repos/${owner}/${repo}/actions/runs/${run_id}`;
    const response = await fetch(url, {
      headers: this.getHeaders(),
    });
    return response.json();
  }

  async getWorkflowRunJobs(owner: string, repo: string, run_id: string) {
    const url = `https://api.github.com/repos/${owner}/${repo}/actions/runs/${run_id}/jobs`;
    const response = await fetch(url, {
      headers: this.getHeaders(),
    });
    return response.json();
  }

  async getFailedJobs(owner: string, repo: string, run_id: string) {
    const url = `https://api.github.com/repos/${owner}/${repo}/actions/runs/${run_id}/jobs`;

    const response = await fetch(url, {
      headers: this.getHeaders({
        Accept: 'application/vnd.github+json',
      }),
    });

    const data = await response.json();

    return data.jobs.filter((job: any) => job.conclusion === 'failure');
  }

  async getSingleFailedJob(owner: string, repo: string, job_id: string) {
    const url = `https://api.github.com/repos/${owner}/${repo}/actions/jobs/${job_id}`;

    const response = await fetch(url, {
      headers: this.getHeaders({
        Accept: 'application/vnd.github+json',
      }),
    });

    return response.json();
  }

  async getJobLogs(owner: string, repo: string, job_id: string) {
    const url = `https://api.github.com/repos/${owner}/${repo}/actions/jobs/${job_id}/logs`;

    const response = await fetch(url, {
      headers: this.getHeaders({
        Accept: 'application/vnd.github+json',
      }),
    });

    return response.text();
  }

  async dispatchWorkflow(
    owner: string,
    repo: string,
    workflow_id: string,
    ref: string = 'main',
  ) {
    const token = process.env.GITHUB_TOKEN;
    const url = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflow_id}/dispatches`;

    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ ref }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[dispatchWorkflow] Error:', response.status, errorText);
        throw new HttpException(
          `GitHub API ${response.status}: ${errorText || response.statusText}`,
          response.status,
        );
      }

      return {
        success: true,
        message: `Workflow ${workflow_id} dispatched successfully on ${ref}.`,
      };
    } catch (err: unknown) {
      if (err instanceof HttpException) throw err;
      const message = err instanceof Error ? err.message : String(err);
      console.error('[dispatchWorkflow] Catch error:', message);
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
