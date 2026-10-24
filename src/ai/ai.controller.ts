import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('investigate')
  async investigate(
    @Body('owner') owner?: string,
    @Body('repo') repo?: string,
    @Body('run_id') run_id?: string,
    @Body('runId') runId?: string,
  ) {
    const finalRunId = run_id || runId;
    if (!owner || !repo || !finalRunId) {
      throw new HttpException(
        'Missing required fields: "owner", "repo", and "run_id" (or "runId") are required.',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.aiService.aiInvestigator(
      owner.trim(),
      repo.trim(),
      String(finalRunId).trim(),
    );
  }

  @Get('investigations')
  async listInvestigations(
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 50;
    const parsedSkip = skip ? parseInt(skip, 10) : 0;
    return this.aiService.findAllInvestigations(parsedLimit, parsedSkip);
  }

  @Get('investigations/:id')
  async getInvestigation(@Param('id') id: string) {
    return this.aiService.findInvestigationById(id);
  }

  @Delete('investigations/:id')
  async deleteInvestigation(@Param('id') id: string) {
    return this.aiService.deleteInvestigationById(id);
  }
}

