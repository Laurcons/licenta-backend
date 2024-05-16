import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors();
  app.useStaticAssets('./trip-data/gtfs', {
    prefix: '/trip-data-gtfs',
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log('Listening on port ' + port, 'bootstrap');
}
bootstrap();
