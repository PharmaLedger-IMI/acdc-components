import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { CatchAllFilter } from './catchall.filter';

async function bootstrap() {
  const PATH_PREFIX = "borest"; // /borest path prefix has x-dependencies on frontend and haproxy routing
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix(PATH_PREFIX); 
  app.enableCors();
  const httpAdapter = app.getHttpAdapter();
  app.useGlobalFilters(new CatchAllFilter(httpAdapter));

  const options = new DocumentBuilder()
    .setTitle('PharmaLedger Anti-Counterfeiting Data Collaboration')
    .setDescription('The Anti-Counterfeiting Data Collaboration Backoffice API description')
    .setVersion(process.env.npm_package_version!)
    .addTag('Main')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup(PATH_PREFIX+'/api', app, document);

  await app.listen(3000);
}
bootstrap();
