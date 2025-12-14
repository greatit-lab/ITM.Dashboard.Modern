// backend/src/main.ts
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS 설정: 운영 환경 도메인 추가 또는 Nginx Reverse Proxy 사용 시 same-origin 정책으로 완화 가능
  app.enableCors({
    //origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    origin: process.env.CORS_ORIGIN || '*', // 보안을 위해 실제 도메인 권장
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(3000);
}

bootstrap().catch((err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});
