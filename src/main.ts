import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const corsOriginEnv = configService.get<string>('CORS_ORIGIN');
  let origin: boolean | string | string[] = 'http://localhost:3000';

  if (corsOriginEnv) {
    if (corsOriginEnv.trim() === '*') {
      origin = true; // Reflects request origin so credentials: true works with wildcard
    } else if (corsOriginEnv.includes(',')) {
      origin = corsOriginEnv.split(',').map((item) => item.trim());
    } else {
      origin = corsOriginEnv.trim();
    }
  }

  app.enableCors({
    origin,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const port = configService.get<number>('PORT') ?? 5000;
  await app.listen(port);
  console.log(`[ReleaseOps Backend] Server listening on port ${port}`);
  console.log(`[ReleaseOps Backend] CORS origin configured as:`, origin);
}
bootstrap();


