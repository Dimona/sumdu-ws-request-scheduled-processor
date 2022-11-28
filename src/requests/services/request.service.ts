import { Injectable, Logger } from '@nestjs/common';
import { REQUESTS } from '@requests/constants/request.constants';
import { AwsDynamodbService } from '@workshop/lib-nest-aws/dist/services/dynamodb';
import { WeatherRequestEntity } from '@requests/entities/weather.request.entity';
import { ConfigService } from '@nestjs/config';
import { EntityAttributes } from '@typedorm/common';
import {
  EntityManagerCountOptions,
  EntityManagerFindOptions,
  EntityManagerUpdateOptions,
} from '@typedorm/core/cjs/src/classes/manager/entity-manager';
import { FindResults } from '@requests/types/aws.dynamodb.types';
import { UpdateBody } from '@typedorm/core/esm/src/classes/expression/update-body-type';

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

  async update({
    primaryKeyAttributes,
    body,
    queryOptions,
  }: {
    primaryKeyAttributes: Partial<WeatherRequestEntity>;
    body: UpdateBody<Omit<WeatherRequestEntity, 'createdAt'>, Omit<WeatherRequestEntity, 'createdAt'>>;
    queryOptions?: EntityManagerUpdateOptions<WeatherRequestEntity>;
  }): Promise<any> {
    return this.awsDynamodbService.getEntityManager(REQUESTS).update(
      WeatherRequestEntity,
      primaryKeyAttributes,
      // @ts-ignore
      body,
      queryOptions,
    );
  }
}
