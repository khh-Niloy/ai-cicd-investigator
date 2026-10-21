import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { ToolExecutorService } from './tools/tool-executor.service';
import { GithubModule } from '../github/github.module';
import {
  Investigation,
  InvestigationSchema,
} from './schemas/investigation.schema';

@Module({
  imports: [
    forwardRef(() => GithubModule),
    MongooseModule.forFeature([
      { name: Investigation.name, schema: InvestigationSchema },
    ]),
  ],
  controllers: [AiController],
  providers: [AiService, ToolExecutorService],
  exports: [AiService, ToolExecutorService],
})
export class AiModule {}
