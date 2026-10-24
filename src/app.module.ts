import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GithubModule } from './github/github.module';
import { AiModule } from './ai/ai.module';

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
    GithubModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

