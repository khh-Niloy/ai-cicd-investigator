import { Type } from '@google/genai';
import { z } from 'zod';

export const responseJsonSchema = {
  type: Type.OBJECT,
  properties: {
    status: {
      type: Type.STRING,
      enum: ['success', 'failure'],
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

export const failedJobZodSchema = z.object({
  jobId: z.coerce.string(),
  jobName: z.string().default('Unknown Job'),
  rootCause: z.string().default('Root cause not determined'),
  evidence: z.string().default(''),
  recommendedFix: z.string().default('No fix suggested'),
});

export const investigationResponseZodSchema = z.object({
  status: z.enum(['success', 'failure']).default('failure'),
  summary: z.string().default('Investigation completed without summary'),
  failedJobs: z.array(failedJobZodSchema).default([]),
});

export type FailedJobDto = z.infer<typeof failedJobZodSchema>;
export type InvestigationResponseDto = z.infer<
  typeof investigationResponseZodSchema
>;
