import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GithubModule } from './github/github.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [GithubModule, AiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
