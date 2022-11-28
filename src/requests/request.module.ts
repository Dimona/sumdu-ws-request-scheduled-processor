import { Module } from '@nestjs/common';
import { RequestService } from '@requests/services/request.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { awsDynamodbConfig } from '@requests/config/aws.dynamodb.config';
import { AwsDynamodbModule, AwsDynamodbModuleOptions } from '@workshop/lib-nest-aws/dist/services/dynamodb';
import { AWS_DYNAMODB_CONFIG } from '@requests/constants/aws.dynamodb.constatns';

@Module({
  imports: [
    ConfigModule.forFeature(awsDynamodbConfig),
    AwsDynamodbModule.registerAsync({
      useFactory(configService: ConfigService) {
        return configService.get<AwsDynamodbModuleOptions>(AWS_DYNAMODB_CONFIG);
      },
      inject: [ConfigService],
    }),
  ],
  providers: [RequestService],
  exports: [RequestService],
})
export class RequestModule {}
