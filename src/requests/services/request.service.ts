import { Injectable, Logger } from '@nestjs/common';
import { REQUESTS } from '@requests/constants/request.constants';
import { AwsDynamodbService } from '@workshop/lib-nest-aws/dist/services/dynamodb';
import { WeatherRequestEntity } from '@requests/entities/weather.request.entity';
import { ConfigService } from '@nestjs/config';
import { EntityAttributes } from '@typedorm/common';
import {
  EntityManagerCountOptions,
  EntityManagerFindOptions,
} from '@typedorm/core/cjs/src/classes/manager/entity-manager';
import { FindResults } from '@requests/types/aws.dynamodb.types';

@Injectable()
export class RequestService {
  private readonly logger = new Logger(RequestService.name);

  constructor(private readonly awsDynamodbService: AwsDynamodbService, private readonly configService: ConfigService) {}

  async count({
    partitionKey,
    queryOptions,
  }: {
    partitionKey: Partial<EntityAttributes<WeatherRequestEntity>>;
    queryOptions: EntityManagerCountOptions<WeatherRequestEntity, Partial<EntityAttributes<WeatherRequestEntity>>>;
  }): Promise<number> {
    return this.awsDynamodbService.getEntityManager(REQUESTS).count(WeatherRequestEntity, partitionKey, queryOptions);
  }

  async find({
    partitionKey,
    queryOptions,
  }: {
    partitionKey: Partial<EntityAttributes<WeatherRequestEntity>>;
    queryOptions: EntityManagerFindOptions<WeatherRequestEntity, any>;
  }): Promise<FindResults<WeatherRequestEntity>> {
    return this.awsDynamodbService.getEntityManager(REQUESTS).find(WeatherRequestEntity, partitionKey, queryOptions);
  }
}
