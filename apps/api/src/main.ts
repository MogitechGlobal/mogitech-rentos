import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Updated CORS configuration for production domains
  app.enableCors({
    origin: [
      'http://localhost:3001',
      'https://mogitech-rentos.vercel.app',
      'https://rentos.mogitechglobal.com',
    ],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
