export const userQuery = (owner: string, repo: string, runId: string) => {
  return `
Investigate this failed GitHub Actions workflow.

Repository owner: ${owner}
Repository name: ${repo}
Workflow run ID: ${runId}

Identify all failed jobs, inspect their logs, determine the root cause,
and recommend fixes based on evidence.
`;
};
