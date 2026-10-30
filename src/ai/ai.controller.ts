import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
} from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

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

