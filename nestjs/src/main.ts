import { NestFactory } from '@nestjs/core'
// import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import * as helmet from 'helmet'
import { AppModule } from './app.module'
import { port } from './config'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.use(helmet())
  app.enableCors()
  // app.useGlobalPipes(new ValidationPipe()) //*Removed until class-transformer CVE is closed

  const options = new DocumentBuilder()
    .setTitle('Safe Places - Nest Js Backend')
    .setDescription('The Safe Places API Specification')
    .setVersion('1.0')
    .build()

  const document = SwaggerModule.createDocument(app, options)
  SwaggerModule.setup('spec', app, document)

  await app.listen(port)
}
bootstrap()
