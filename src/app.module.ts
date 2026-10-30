import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GithubModule } from './github/github.module';
import { AiModule } from './ai/ai.module';
import { QueuesModule } from './queues/queues.module';
import { WorkersModule } from './workers/workers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const uri = configService.get<string>('MONGODB_URI');
        if (!uri) {
          console.warn(
            '[ReleaseOps] WARNING: MONGODB_URI environment variable is not defined. Using default fallback URI: mongodb://127.0.0.1:27017/release_ops',
          );
        }
        return {
          uri: uri || 'mongodb://127.0.0.1:27017/release_ops',
          serverSelectionTimeoutMS: 5000,
        };
      },
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST') || '127.0.0.1',
          port: Number(configService.get<number>('REDIS_PORT')) || 6379,
          password: configService.get<string>('REDIS_PASSWORD') || undefined,
        },
      }),
    }),
    QueuesModule,
    WorkersModule,
    GithubModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

