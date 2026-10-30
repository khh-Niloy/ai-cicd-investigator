import { forwardRef, Module } from '@nestjs/common';
import { GithubService } from './github.service';
import { GithubController, GithubReposController } from './github.controller';
import { AiModule } from 'src/ai/ai.module';
import { QueuesModule } from '../queues/queues.module';

@Module({
  imports: [forwardRef(() => AiModule), QueuesModule],
  providers: [GithubService],
  controllers: [GithubController, GithubReposController],
  exports: [GithubService],
})
export class GithubModule {}
