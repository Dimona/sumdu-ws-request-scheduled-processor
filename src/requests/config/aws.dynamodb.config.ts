import { registerAs } from '@nestjs/config';
import { WeatherRequestEntity } from '@requests/entities/weather.request.entity';
import { INDEX_TYPE, Table } from '@typedorm/common';
import { REQUESTS, statusUpdatedAtIndex } from '@requests/constants/request.constants';
import { AWS_DYNAMODB_API_VERSION, AwsDynamodbModuleOptions } from '@workshop/lib-nest-aws/dist/services/dynamodb';
import { AWS_DYNAMODB_CONFIG } from '@requests/constants/aws.dynamodb.constatns';

export const awsDynamodbConfig = registerAs(AWS_DYNAMODB_CONFIG, () => {
  const env = process.env.ENVIRONMENT;

  return <AwsDynamodbModuleOptions>{
    client: {
      apiVersion: process.env.AWS_DYNAMODB_API_VERSION || AWS_DYNAMODB_API_VERSION,
      endpoint: env === 'local' ? process.env.DYNAMODB_LOCAL : undefined,
      retryMode: 'standard',
    },
    connections: {
      [REQUESTS]: {
        table: new Table({
          name: `${
            process.env.MOCK_DYNAMODB_ENDPOINT
              ? 'ws-weather-requests-test'
              : process.env.WS_WEATHER_REQUESTS_DYNAMODB_TABLE
          }`,
          partitionKey: 'id',
          indexes: {
            [statusUpdatedAtIndex]: {
              type: INDEX_TYPE.GSI,
              partitionKey: 'status',
              sortKey: 'updatedAt',
            },
          },
        }),
        entities: [WeatherRequestEntity],
      },
    },
  };
});
