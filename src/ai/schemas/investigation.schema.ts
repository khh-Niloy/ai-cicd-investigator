import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type InvestigationDocument = HydratedDocument<Investigation>;

export type InvestigationStatus = 'success' | 'failure' | 'unknown';

@Schema({ _id: false })
export class FailedJob {
  @Prop({ required: true, trim: true })
  jobId: string;

  @Prop({ required: true, trim: true })
  jobName: string;

  @Prop({ required: true, trim: true })
  rootCause: string;

  @Prop({ default: '', trim: true })
  evidence: string;

  @Prop({ required: true, trim: true })
  recommendedFix: string;
}

export const FailedJobSchema = SchemaFactory.createForClass(FailedJob);

@Schema({ timestamps: true })
export class Investigation {
  @Prop({ required: true, trim: true, index: true })
  owner: string;

  @Prop({ required: true, trim: true, index: true })
  repo: string;

  @Prop({ required: true, trim: true, index: true })
  runId: string;

  @Prop({
    required: true,
    enum: ['success', 'failure', 'unknown'],
    default: 'unknown',
  })
  status: InvestigationStatus;

  @Prop({ required: true, trim: true })
  summary: string;

  @Prop({ type: [FailedJobSchema], default: [] })
  failedJobs: FailedJob[];
}

export const InvestigationSchema = SchemaFactory.createForClass(Investigation);

// Composite index for fast lookup of a specific run's investigation
InvestigationSchema.index({ owner: 1, repo: 1, runId: 1 });
