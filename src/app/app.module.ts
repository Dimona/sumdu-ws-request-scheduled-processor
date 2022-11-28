import { Module } from '@nestjs/common';
import { RequestModule } from '@requests/request.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppService } from '@app/services/app.service';
import { AwsSqsModule, AwsSqsModuleOptions } from '@workshop/lib-nest-aws/dist/services/sqs';
import { AWS_SQS_CONFIG } from '@app/constants/aws.sqs.constatns';
import { awsSqsConfig } from '@app/config/aws.sqs.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    RequestModule,
    ConfigModule.forFeature(awsSqsConfig),
    AwsSqsModule.registerAsync({
      useFactory(configService: ConfigService) {
        return configService.get<AwsSqsModuleOptions>(AWS_SQS_CONFIG);
      },
      inject: [ConfigService],
    }),
  ],
  providers: [AppService],
})
export class AppModule {}
