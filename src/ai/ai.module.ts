import { forwardRef, Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { ToolExecutorService } from './tools/tool-executor.service';
import { GithubModule } from 'src/github/github.module';

@Module({
  imports: [forwardRef(() => GithubModule)],
  controllers: [AiController],
  providers: [AiService, ToolExecutorService],
  exports: [AiService, ToolExecutorService],
})
export class AiModule {}
