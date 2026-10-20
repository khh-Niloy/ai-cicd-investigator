import { Type } from '@google/genai';

export const responseJsonSchema = {
  type: Type.OBJECT,
  properties: {
    status: {
      type: Type.STRING,
      enum: ['success', 'failure', 'unknown'],
    },
    summary: {
      type: Type.STRING,
    },
    failedJobs: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          jobId: { type: Type.STRING },
          jobName: { type: Type.STRING },
          rootCause: { type: Type.STRING },
          evidence: { type: Type.STRING },
          recommendedFix: { type: Type.STRING },
        },
        required: [
          'jobId',
          'jobName',
          'rootCause',
          'evidence',
          'recommendedFix',
        ],
      },
    },
  },
  required: ['status', 'summary', 'failedJobs'],
};
