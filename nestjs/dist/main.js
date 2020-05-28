"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const helmet = require("helmet");
const app_module_1 = require("./app.module");
const Normalize_1 = require("./interceptors/Normalize");
const config_1 = require("./config");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use(helmet());
    app.enableCors();
    app.useGlobalInterceptors(new Normalize_1.NormalizeInterceptor());
    app.useGlobalPipes(new common_1.ValidationPipe());
    const options = new swagger_1.DocumentBuilder()
        .setTitle('Safe Places - Nest Js Backend')
        .setDescription('The Safe Places API Specification')
        .setVersion('1.0')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, options);
    swagger_1.SwaggerModule.setup('spec', app, document);
    await app.listen(config_1.port);
}
bootstrap();
//# sourceMappingURL=main.js.map