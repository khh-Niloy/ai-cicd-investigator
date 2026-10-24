import { Injectable } from '@nestjs/common';

@Injectable()
export class GithubService {
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

  //   async getWorkflowRunJob(owner: string, repo: string, job_id: string) {
  //     const url = `https://api.github.com/repos/${owner}/${repo}/actions/jobs/${job_id}`;
  //     const response = await fetch(url, {
  //       headers: {
  //         Accept: 'application/vnd.github.v3+json',
  //         'X-GitHub-Api-Version': '2022-11-28',
  //       },
  //     });
  //     return response.json();
  //   }
}
