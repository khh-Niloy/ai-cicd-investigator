import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('investigate')
  async investigate(
    @Body('owner') owner: string,
    @Body('repo') repo: string,
    @Body('run_id') run_id: string,
  ) {
    return this.aiService.aiInvestigator(owner, repo, run_id);
  }
}
