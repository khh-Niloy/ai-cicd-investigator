import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const corsOriginEnv = process.env.CORS_ORIGIN;
  let origin: boolean | string | string[] = 'http://localhost:3000';

  if (corsOriginEnv) {
    const trimmed = corsOriginEnv.trim();
    if (trimmed === '*') {
      origin = true; // Reflects request origin so credentials: true works with wildcard
    } else {
      const parsedOrigins = trimmed
        .split(',')
        .map((item) => item.trim().replace(/\/+$/, ''))
        .filter(Boolean);
      origin = parsedOrigins.length === 1 ? parsedOrigins[0] : parsedOrigins;
    }
  }

  app.enableCors({
    origin,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
  await app.listen(port);
  console.log(`[ReleaseOps Backend] Server listening on port ${port}`);
  console.log(`[ReleaseOps Backend] CORS origin configured as:`, origin);
}
bootstrap();


