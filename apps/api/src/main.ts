import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // This bypasses TypeScript's strict rules so Render won't crash!
  const cookieParser = require('cookie-parser');
  app.use(cookieParser()); 

  // CORS configuration
  app.enableCors({
    origin: [
      'http://localhost:3001',
      'http://172.30.112.1:3001',
      'https://mogitech-rentos.vercel.app',
      'https://rentos.mogitechglobal.com',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();