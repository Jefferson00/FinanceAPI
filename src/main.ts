import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  /*   const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app); */
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      forbidUnknownValues: false,
      validationError: { target: false },
      whitelist: true,
    }),
  );
  app.use('/static', express.static(path.resolve(__dirname, '..', 'uploads')));
  const port = process.env.PORT || 3333;
  await app.listen(port, () => {
    Logger.log(`Listening at http://localhost:${port}`);
  });
}
bootstrap();
