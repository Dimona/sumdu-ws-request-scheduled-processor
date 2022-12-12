import { NestFactory } from '@nestjs/core';
import { Handler } from 'aws-lambda';
import { AppModule } from '@app/app.module';
import { AppService } from '@app/services/app.service';
import { HttpStatus, INestApplicationContext } from '@nestjs/common';

let app: INestApplicationContext;

const bootstrap = async (): Promise<void> => {
  app = app || (await NestFactory.createApplicationContext(AppModule));

  await app.get(AppService).execute();
};

export const handler: Handler = async () => {
  return {
    body: await bootstrap(),
    statusCode: HttpStatus.OK,
  };
};
