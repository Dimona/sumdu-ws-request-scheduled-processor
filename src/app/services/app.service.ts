import dayjs from 'dayjs';
import { Injectable, Logger } from '@nestjs/common';
import { AwsSqsModuleOptions, AwsSqsService } from '@workshop/lib-nest-aws/dist/services/sqs';
import { SendMessageCommand } from '@aws-sdk/client-sqs';
import { ConfigService } from '@nestjs/config';
import { AWS_SQS_CONFIG } from '@app/constants/aws.sqs.constatns';
import { AwsSqsQueue } from '@app/enums/aws.sqs.enums';
import { statusNextTimeIndex, WeatherRequestService, WeatherRequestStatus } from '@workshop/lib-nest-weather-request';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  private readonly queues: AwsSqsModuleOptions['queues'];

  constructor(
    private readonly configService: ConfigService,
    private readonly weatherRequestService: WeatherRequestService,
    private readonly awsSqsService: AwsSqsService,
  ) {
    this.queues = this.configService.get<AwsSqsModuleOptions>(AWS_SQS_CONFIG).queues;
  }

  async execute(): Promise<void> {
    try {
      const total = await this.weatherRequestService.count({
        partitionKey: { status: WeatherRequestStatus.DONE },
        queryOptions: { queryIndex: statusNextTimeIndex },
      });

      const limit = 200;
      let offset = 0;
      let cursor: unknown;
      while (offset < total) {
        const requests = await this.weatherRequestService.find({
          partitionKey: {
            status: WeatherRequestStatus.DONE,
          },
          queryOptions: {
            queryIndex: statusNextTimeIndex,
            limit,
            // keyCondition: {
            //   BETWEEN: [dayjs().subtract(6, 'minutes').unix(), dayjs().unix()],
            // },
            // where: {
            //   AND: {
            //     nextTime: {
            //       BETWEEN: [dayjs().subtract(6, 'minutes').unix(), dayjs().unix()],
            //     },
            //   },
            // },
            cursor,
          },
        });

        // console.log(requests.items);

        await Promise.all(
          requests.items.map(async request => {
            try {
              await this.awsSqsService.send(
                new SendMessageCommand({
                  QueueUrl: this.queues[AwsSqsQueue.WEATHER_REQUESTS],
                  MessageBody: JSON.stringify(request),
                }),
              );
              await this.weatherRequestService.update({
                primaryKeyAttributes: { id: request.id, targetDate: request.targetDate },
                body: { status: WeatherRequestStatus.QUEUED },
              });
            } catch (err) {
              this.logger.error(err);
              await this.weatherRequestService.update({
                primaryKeyAttributes: { id: request.id, targetDate: request.targetDate },
                body: { status: WeatherRequestStatus.FAILED, error: err.trace },
              });
            }
          }),
        );
        ({ cursor } = requests);

        offset += limit;
      }

      this.logger.log(`Successfully finished at ${new Date().toISOString()}`);
    } catch (err) {
      this.logger.error(err);

      throw err;
    }
  }
}
