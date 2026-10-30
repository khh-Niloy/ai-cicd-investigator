import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  FunctionCallingConfigMode,
  GoogleGenAI,
  GenerateContentConfig,
  GenerateContentResponse,
} from '@google/genai';
import { systemInstruction } from './helper/systemInstruction';
import { githubTools } from './tools/github.tools';
import { ToolExecutorService } from './tools/tool-executor.service';
import { userQuery } from './helper/userQuery';
import type { Content } from '@google/genai';
import {
  Investigation,
  InvestigationDocument,
} from './schemas/investigation.schema';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly maxToolIterations =
    Number(process.env.MAX_TOOL_ITERATIONS) || 10;
  private readonly aiCallTimeoutMs = 20_000; // 20s timeout per Gemini API call
  private readonly totalTimeoutMs = 90_000; // 90s total timeout for investigation
  private readonly primaryModel = process.env.PRIMARY_MODEL!;
  private readonly fallbackModel = process.env.FALLBACK_MODEL!;

  constructor(
    private readonly toolExecutorService: ToolExecutorService,
    @InjectModel(Investigation.name)
    private readonly investigationModel: Model<InvestigationDocument>,
  ) {}

  async aiInvestigator(owner: string, repo: string, run_id: string) {
    if (!process.env.GEMINI_API_KEY) {
      throw new HttpException(
        'GEMINI_API_KEY is not configured on the server',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const client = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: { timeout: this.aiCallTimeoutMs },
    });
    const intiContent = userQuery(owner, repo, run_id);

    const contents: Content[] = [
      {
        role: 'user',
        parts: [{ text: intiContent }],
      },
    ];

    const abortSignal = AbortSignal.timeout(this.totalTimeoutMs);

    const config: GenerateContentConfig = {
      systemInstruction: systemInstruction,
      tools: [
        {
          functionDeclarations: githubTools,
        },
      ],
      toolConfig: {
        functionCallingConfig: {
          mode: FunctionCallingConfigMode.AUTO,
        },
      },
      temperature: 0.1,
      httpOptions: { timeout: this.aiCallTimeoutMs },
      abortSignal,
    };

    let activeModel = this.primaryModel;

    const generateWithFallback = async (
      callConfig: GenerateContentConfig,
    ): Promise<GenerateContentResponse> => {
      try {
        return await client.models.generateContent({
          model: activeModel,
          config: callConfig,
          contents,
        });
      } catch (error: any) {
        if (
          abortSignal.aborted ||
          error?.name === 'AbortError' ||
          activeModel === this.fallbackModel
        ) {
          throw error;
        }

        this.logger.warn(
          `Primary model (${activeModel}) failed (${error?.message || error}). Switching to fallback model (${this.fallbackModel})...`,
        );
        activeModel = this.fallbackModel;

        return await client.models.generateContent({
          model: activeModel,
          config: callConfig,
          contents,
        });
      }
    };

    let result: GenerateContentResponse;
    let iterationCount = 0;

    try {
      // It gives the very first tool (or set of tools) Gemini needs to start the investigation.
      result = await generateWithFallback(config);

      while (result.functionCalls?.length) {
        if (iterationCount >= this.maxToolIterations) {
          this.logger.warn(
            `Reached maximum tool call iterations (${this.maxToolIterations}). Halting tool calls.`,
          );
          break;
        }

        if (abortSignal.aborted) {
          throw new HttpException(
            `AI investigation timed out after ${this.totalTimeoutMs / 1000} seconds`,
            HttpStatus.GATEWAY_TIMEOUT,
          );
        }

        iterationCount++;
        this.logger.log(
          `Gemini requested tool call(s) (iteration ${iterationCount}/${this.maxToolIterations})`,
        );

        contents.push({
          role: 'model',
          parts: result.candidates?.[0]?.content?.parts ?? [],
        });

        for (const call of result.functionCalls) {
          if (!call.name) continue;

          const toolResult = await this.toolExecutorService.executeTool(
            call.name,
            (call.args ?? {}) as Record<string, any>,
          );

          contents.push({
            role: 'user',
            parts: [
              {
                functionResponse: {
                  name: call.name,
                  response: {
                    result: toolResult,
                  },
                },
              },
            ],
          });
        }

        //  Gemini analyzes the tool results and either:a. Calls more tools (if it needs more info).b. Generates the final response (if it has enough).
        result = await generateWithFallback(config);
      }

      // If loop exited because of reaching max iterations without a final text response, request synthesis without tools
      if (!result.text && iterationCount >= this.maxToolIterations) {
        this.logger.log(
          'Tool iteration limit reached; requesting final JSON summary without tools...',
        );
        contents.push({
          role: 'user',
          parts: [
            {
              text: 'Maximum tool call iterations reached. Provide your final investigation report in the required JSON format now based on the information gathered so far without making further tool calls.',
            },
          ],
        });

        result = await generateWithFallback({
          ...config,
          toolConfig: {
            functionCallingConfig: {
              mode: FunctionCallingConfigMode.NONE,
            },
          },
        });
      }
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }

      if (
        error?.name === 'AbortError' ||
        error?.name === 'TimeoutError' ||
        abortSignal.aborted ||
        error?.message?.toLowerCase().includes('timeout') ||
        error?.message?.toLowerCase().includes('aborted')
      ) {
        this.logger.error(
          `AI investigation timed out after ${this.totalTimeoutMs / 1000} seconds`,
        );
        throw new HttpException(
          `AI investigation timed out after ${this.totalTimeoutMs / 1000} seconds`,
          HttpStatus.GATEWAY_TIMEOUT,
        );
      }

      this.logger.error('Error during AI generation:', error?.message || error);
      throw error;
    }

    if (!result.text) {
      throw new HttpException(
        iterationCount >= this.maxToolIterations
          ? `Maximum tool call iterations (${this.maxToolIterations}) reached without generating a final response`
          : 'No response text returned from Gemini model',
        HttpStatus.BAD_GATEWAY,
      );
    }

    // Clean any markdown fences or surrounding text to safely parse JSON
    const cleanedText = result.text
      .replace(/```(?:json)?\s*|\s*```/g, '')
      .trim();
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : cleanedText;

    let jsonResult: any;
    try {
      jsonResult = JSON.parse(jsonString);
    } catch (parseError) {
      this.logger.error('Failed to parse Gemini output as JSON:', jsonString);
      throw new HttpException(
        'AI output could not be parsed as valid JSON investigation response',
        HttpStatus.BAD_GATEWAY,
      );
    }

    console.log(jsonResult);

    // Sanitize and normalize fields based on existing schema
    const validStatuses = ['success', 'failure'];
    const status = validStatuses.includes(jsonResult.status)
      ? jsonResult.status
      : 'failure';
    const summary =
      jsonResult.summary || 'Investigation completed without summary';
    const failedJobs = Array.isArray(jsonResult.failedJobs)
      ? jsonResult.failedJobs.map((job: any) => ({
          jobId: String(job.jobId || ''),
          jobName: String(job.jobName || 'Unknown Job'),
          rootCause: String(job.rootCause || 'Root cause not determined'),
          evidence: String(job.evidence || ''),
          recommendedFix: String(job.recommendedFix || 'No fix suggested'),
        }))
      : [];

    // Persist investigation to MongoDB
    try {
      const savedDoc = await this.investigationModel.create({
        owner: owner.trim(),
        repo: repo.trim(),
        runId: String(run_id).trim(),
        status,
        summary,
        failedJobs,
      });
      console.log(savedDoc);

      this.logger.log(`Persisted investigation: ${savedDoc._id}`);
      return savedDoc.toObject();
    } catch (dbError: any) {
      this.logger.error(
        'Database persistence error:',
        dbError?.message || dbError,
      );
      // Return the generated result even if DB is temporarily unreachable, noting the status
      return {
        owner,
        repo,
        runId: String(run_id),
        status,
        summary,
        failedJobs,
        _persisted: false,
        _persistenceError:
          'Investigation completed, but could not be saved to MongoDB. Please verify MONGODB_URI.',
      };
    }
  }

  async saveSuccessRun(
    owner: string,
    repo: string,
    runId: string,
    summary?: string,
  ) {
    const finalSummary =
      summary || 'Workflow completed successfully with all jobs passing.';
    try {
      const savedDoc = await this.investigationModel.findOneAndUpdate(
        {
          owner: owner.trim(),
          repo: repo.trim(),
          runId: String(runId).trim(),
        },
        {
          owner: owner.trim(),
          repo: repo.trim(),
          runId: String(runId).trim(),
          status: 'success',
          summary: finalSummary,
          failedJobs: [],
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );

      this.logger.log(`Persisted success run: ${savedDoc._id}`);
      return savedDoc.toObject ? savedDoc.toObject() : savedDoc;
    } catch (dbError: any) {
      this.logger.error(
        'Database persistence error for success run:',
        dbError?.message || dbError,
      );
      return {
        owner,
        repo,
        runId: String(runId),
        status: 'success',
        summary: finalSummary,
        failedJobs: [],
        _persisted: false,
      };
    }
  }

  async findAllInvestigations(limit = 50, skip = 0) {
    try {
      const safeLimit = Math.min(Math.max(limit, 1), 100);
      const safeSkip = Math.max(skip, 0);

      const [items, total] = await Promise.all([
        this.investigationModel
          .find()
          .sort({ createdAt: -1 })
          .limit(safeLimit)
          .skip(safeSkip)
          .lean()
          .exec(),
        this.investigationModel.countDocuments().exec(),
      ]);

      return {
        items,
        total,
        limit: safeLimit,
        skip: safeSkip,
      };
    } catch (error: any) {
      this.logger.error(
        'Error fetching investigations:',
        error?.message || error,
      );
      throw new HttpException(
        'Failed to fetch investigations. Ensure database is accessible and MONGODB_URI is configured.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async findInvestigationById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new HttpException(
        'Invalid investigation ID format',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const doc = await this.investigationModel.findById(id).lean().exec();
      if (!doc) {
        throw new HttpException(
          'Investigation not found',
          HttpStatus.NOT_FOUND,
        );
      }
      return doc;
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      this.logger.error(
        'Error retrieving investigation:',
        error?.message || error,
      );
      throw new HttpException(
        'Database error retrieving investigation',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async deleteInvestigationById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new HttpException(
        'Invalid investigation ID format',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const deleted = await this.investigationModel
        .findByIdAndDelete(id)
        .exec();
      if (!deleted) {
        throw new HttpException(
          'Investigation not found',
          HttpStatus.NOT_FOUND,
        );
      }
      return {
        success: true,
        message: 'Investigation deleted successfully',
        id,
      };
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      this.logger.error(
        'Error deleting investigation:',
        error?.message || error,
      );
      throw new HttpException(
        'Database error deleting investigation',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
