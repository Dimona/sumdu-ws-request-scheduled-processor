import { registerAs } from '@nestjs/config';
import { AWS_SQS_CONFIG } from '@app/constants/aws.sqs.constatns';
import { AWS_SQS_API_VERSION, AwsSqsModuleOptions } from '@workshop/lib-nest-aws/dist/services/sqs';
import { AwsSqsQueue } from '@app/enums/aws.sqs.enums';

export const awsSqsConfig = registerAs(AWS_SQS_CONFIG, () => {
  const env = process.env.ENVIRONMENT;

  return <AwsSqsModuleOptions>{
    client: {
      apiVersion: process.env.AWS_SQS_API_VERSION || AWS_SQS_API_VERSION,
      endpoint: env === 'local' ? process.env.SQS_LOCAL : undefined,
      retryMode: 'standard',
    },
    queues: {
      [AwsSqsQueue.WEATHER_REQUESTS]: process.env.WS_WEATHER_REQUESTS_QUEUE_URL,
    },
  };
});
