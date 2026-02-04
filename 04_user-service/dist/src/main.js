"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const kafka_bootstrap_service_1 = require("./infrastructure/kafka/kafka-bootstrap.service");
async function bootstrap() {
    var _a;
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    try {
        const kafkaBootstrap = app.get(kafka_bootstrap_service_1.KafkaBootstrapService);
        console.log('✅ KafkaBootstrapService initialized');
    }
    catch (error) {
        console.error('❌ KafkaBootstrapService not found:', error);
    }
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
    }));
    app.setGlobalPrefix('api/v1');
    const config = new swagger_1.DocumentBuilder()
        .setTitle('User Service API')
        .setDescription('User management microservice')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    app.enableCors({
        origin: ((_a = process.env.CORS_ORIGIN) === null || _a === void 0 ? void 0 : _a.split(',')) || '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        credentials: true,
    });
    const port = process.env.PORT || 3002;
    await app.listen(port);
    console.log(`✅ User service is running on port ${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map