### 1. [listWorkflowRuns()](file:///Users/mac/Documents/workspace/projects/release-ops-ai-ci-cd-investigator-tool-calling/backend/src/github/github.service.ts#L7-L16)

- **URL:** `GET /repos/${owner}/${repo}/actions/runs`
- **Purpose:** Lists recent workflow runs for the repo.
- **Returns:** Array of runs with overall status (`completed`, `in_progress`), conclusion (`success`, `failure`), and their `run_id`s.

---

### 2. [getSingleWorkflowRun()](file:///Users/mac/Documents/workspace/projects/release-ops-ai-ci-cd-investigator-tool-calling/backend/src/github/github.service.ts#L18-L27)

- **URL:** `GET /repos/${owner}/${repo}/actions/runs/${run_id}`
- **Purpose:** Gets high-level summary and overall status of **one specific workflow run**.
- **Returns:** Trigger event, commit SHA, branch, start/end time, and whether the overall run passed or failed.

---

### 3. [getWorkflowRunJobs()](file:///Users/mac/Documents/workspace/projects/release-ops-ai-ci-cd-investigator-tool-calling/backend/src/github/github.service.ts#L29-L38)

- **URL:** `GET /repos/${owner}/${repo}/actions/runs/${run_id}/jobs`
- **Purpose:** Lists **all jobs** that ran inside that workflow run.
- **Returns:** Array of all jobs (build, test, deploy, etc.) with each job's name, status, and unique `job_id`.

---

### 4. [getSingleFailedJob()](file:///Users/mac/Documents/workspace/projects/release-ops-ai-ci-cd-investigator-tool-calling/backend/src/github/github.service.ts#L55-L66)

- **URL:** `GET /repos/${owner}/${repo}/actions/jobs/${job_id}`
- **Purpose:** Inspects **step-by-step details** of a single job.
- **Returns:** Which runner was used and which exact step failed (e.g., failed on step _"Run npm test"_).

---

### 5. [getJobLogs()](file:///Users/mac/Documents/workspace/projects/release-ops-ai-ci-cd-investigator-tool-calling/backend/src/github/github.service.ts#L68-L80)

- **URL:** `GET /repos/${owner}/${repo}/actions/jobs/${job_id}/logs`
- **Purpose:** Downloads the **raw terminal output (console logs)** of that job.
- **Returns:** The plain-text error messages, stack traces, and compiler errors that Gemini reads to diagnose root causes and recommend fixes.
