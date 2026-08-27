import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  // 1. Explicitly type the app as a NestExpressApplication
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 2. CRITICAL FIX FOR LIVE URLS: Trust the reverse proxy
  // This tells Express to trust the X-Forwarded-Proto header from Render/Vercel
  // allowing it to successfully attach cookies marked as "Secure: true"
  app.set('trust proxy', 1);

  // This bypasses TypeScript's strict rules so Render won't crash!
  const cookieParser = require('cookie-parser');
  app.use(cookieParser()); 

  // CORS configuration
  app.enableCors({
    origin: [
      'http://localhost:3001',
      'http://172.30.112.1:3001',
      'https://mogitech-rentos-pi.vercel.app',
      'https://rentos.mogitechglobal.com',
      'https://mogirent.co.ke',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();