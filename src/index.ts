import { NestFactory } from '@nestjs/core';
import { Callback, Context, Handler } from 'aws-lambda';
import { AppModule } from '@app/app.module';
import { AppService } from '@app/services/app.service';
import { HttpStatus, INestApplicationContext } from '@nestjs/common';

let app: INestApplicationContext;

const bootstrap = async (): Promise<void> => {
  app = app || (await NestFactory.createApplicationContext(AppModule));

  await app.get(AppService).execute();
};

export const handler: Handler = async (event: any, context: Context, callback: Callback) => {
  return {
    body: await bootstrap(),
    statusCode: HttpStatus.OK,
  };
};
