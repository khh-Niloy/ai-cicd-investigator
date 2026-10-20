import { Injectable } from '@nestjs/common';

@Injectable()
export class GithubService {
  constructor() {}

  async listWorkflowRuns(owner: string, repo: string) {
    const url = `https://api.github.com/repos/${owner}/${repo}/actions/runs`;
    const response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });
    return response.json();
  }

  async getSingleWorkflowRun(owner: string, repo: string, run_id: string) {
    const url = `https://api.github.com/repos/${owner}/${repo}/actions/runs/${run_id}`;
    const response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });
    return response.json();
  }

  async getWorkflowRunJobs(owner: string, repo: string, run_id: string) {
    const url = `https://api.github.com/repos/${owner}/${repo}/actions/runs/${run_id}/jobs`;
    const response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });
    return response.json();
  }

  async getFailedJobs(owner: string, repo: string, run_id: string) {
    const url = `https://api.github.com/repos/${owner}/${repo}/actions/runs/${run_id}/jobs`;

    const response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    const data = await response.json();

    return data.jobs.filter((job: any) => job.conclusion === 'failure');
  }

  async getSingleFailedJob(owner: string, repo: string, job_id: string) {
    const url = `https://api.github.com/repos/${owner}/${repo}/actions/jobs/${job_id}`;

    const response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    return response.json();
  }

  async getJobLogs(owner: string, repo: string, job_id: string) {
    const url = `https://api.github.com/repos/${owner}/${repo}/actions/jobs/${job_id}/logs`;

    const response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    return response.text();
  }
}
