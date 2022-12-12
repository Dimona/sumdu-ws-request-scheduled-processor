import { AppModule } from '@app/app.module';
import { NestFactory } from '@nestjs/core';
import { AppService } from '@app/services/app.service';

const bootstrap = async () => {
  const app = await NestFactory.createApplicationContext(AppModule);

  await app.get(AppService).execute();
  process.exit();
};

bootstrap();
