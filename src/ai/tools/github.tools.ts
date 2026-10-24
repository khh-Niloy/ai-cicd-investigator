import { Type } from '@google/genai';
import type { FunctionDeclaration } from '@google/genai';

export const githubTools: FunctionDeclaration[] = [
  {
    name: 'listWorkflowRuns',
    description:
      'Retrieve recent GitHub Actions workflow runs for a repository. Use this when the user asks to list runs, check recent CI activity, or identify a failed workflow. Requires the repository owner and name. This method returns a list of workflow runs sorted by run_id in descending order.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        owner: {
          type: Type.STRING,
          description: 'GitHub repository owner username or organization.',
        },
        repo: {
          type: Type.STRING,
          description: 'GitHub repository name.',
        },
      },
      required: ['owner', 'repo'],
    },
  },
  {
    name: 'getSingleWorkflowRun',
    description:
      'Retrieve details and status for a specific GitHub Actions workflow run. Use this when the user asks about a particular run or when investigating a run identified by its run ID. Requires the repository owner, name, and run ID. Use this when the user asks for details about a specific workflow run (e.g., "What is the status of run 12345?") or when investigating a particular run identified by its ID. Returns comprehensive information about the run, including its status, conclusion, and timing.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        owner: {
          type: Type.STRING,
          description: 'GitHub repository owner username or organization.',
        },
        repo: {
          type: Type.STRING,
          description: 'GitHub repository name.',
        },
        run_id: {
          type: Type.STRING,
          description: 'ID of the workflow run.',
        },
      },
      required: ['owner', 'repo', 'run_id'],
    },
  },
  {
    name: 'getWorkflowRunJobs',
    description:
      'Retrieve jobs and their statuses for a specific workflow run. Use this during failure investigation to identify failed jobs and inspect job-level conclusions. Requires the repository owner, name, and run ID. Use this when the user asks about the jobs within a specific workflow run (e.g., "What jobs ran in run 12345 and which failed?") or when you need to investigate individual jobs within a run.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        owner: {
          type: Type.STRING,
          description: 'GitHub repository owner username or organization.',
        },
        repo: {
          type: Type.STRING,
          description: 'GitHub repository name.',
        },
        run_id: {
          type: Type.STRING,
          description: 'ID of the workflow run.',
        },
      },
      required: ['owner', 'repo', 'run_id'],
    },
  },
  {
    name: 'getFailedJobs',
    description:
      'Retrieve failed jobs for a specific workflow run. Use this during failure investigation to identify failed jobs and inspect job-level conclusions. Requires the repository owner, name, and run ID. Use this when the user asks about the failed jobs within a specific workflow run (e.g., "What jobs failed in run 12345?") or when you need to investigate individual jobs within a run.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        owner: {
          type: Type.STRING,
          description: 'GitHub repository owner username or organization.',
        },
        repo: {
          type: Type.STRING,
          description: 'GitHub repository name.',
        },
        run_id: {
          type: Type.STRING,
          description: 'ID of the workflow run.',
        },
      },
      required: ['owner', 'repo', 'run_id'],
    },
  },
  {
    name: 'getSingleFailedJob',
    description:
      'Retrieve details for a specific failed job. Use this during failure investigation to inspect job-level conclusions and details. Requires the repository owner, name, and job ID. Use this when the user asks about the details of a specific failed job (e.g., "What is the status of job 12345?") or when you need to investigate individual jobs within a run.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        owner: {
          type: Type.STRING,
          description: 'GitHub repository owner username or organization.',
        },
        repo: {
          type: Type.STRING,
          description: 'GitHub repository name.',
        },
        job_id: {
          type: Type.STRING,
          description: 'ID of the job.',
        },
      },
      required: ['owner', 'repo', 'job_id'],
    },
  },
  {
    name: 'getJobLogs',
    description:
      'Retrieve the actual execution logs for a specific GitHub Actions job. Use this during failure investigation to identify error messages, failed commands, test failures, and possible root causes. Requires the repository owner, name, and job ID. Use this after identifying a failed job to inspect its logs and recommend a specific fix.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        owner: {
          type: Type.STRING,
          description: 'GitHub repository owner username or organization.',
        },
        repo: {
          type: Type.STRING,
          description: 'GitHub repository name.',
        },
        job_id: {
          type: Type.STRING,
          description:
            'ID of the GitHub Actions job whose logs should be retrieved.',
        },
      },
      required: ['owner', 'repo', 'job_id'],
    },
  },
];
