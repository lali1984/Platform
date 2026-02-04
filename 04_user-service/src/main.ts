import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { KafkaBootstrapService } from './infrastructure/kafka/kafka-bootstrap.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Kafka инициализация будет через KafkaBootstrapService.onModuleInit()
  // Дополнительная проверка
  try {
    const kafkaBootstrap = app.get(KafkaBootstrapService);
    console.log('✅ KafkaBootstrapService initialized');
  } catch (error) {
    console.error('❌ KafkaBootstrapService not found:', error);
  }

  // Глобальные пайпы
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Глобальные префиксы
  app.setGlobalPrefix('api/v1');

  // Swagger документация
  const config = new DocumentBuilder()
    .setTitle('User Service API')
    .setDescription('User management microservice')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });

  const port = process.env.PORT || 3002;
  await app.listen(port);
  console.log(`✅ User service is running on port ${port}`);
}

bootstrap();