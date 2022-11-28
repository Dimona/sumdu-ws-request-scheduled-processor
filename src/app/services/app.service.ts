import { Injectable, Logger } from '@nestjs/common';
import { RequestService } from '@requests/services/request.service';
import { RequestStatus } from '@requests/enums/request.enums';
import { LIMIT, statusUpdatedAtIndex } from '@requests/constants/request.constants';
import { AwsSqsModuleOptions, AwsSqsService } from '@workshop/lib-nest-aws/dist/services/sqs';
import { SendMessageCommand } from '@aws-sdk/client-sqs';
import { ConfigService } from '@nestjs/config';
import { AWS_SQS_CONFIG } from '@app/constants/aws.sqs.constatns';
import { AwsSqsQueue } from '@app/enums/aws.sqs.enums';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  private readonly queues: AwsSqsModuleOptions['queues'];

  constructor(
    private readonly configService: ConfigService,
    private readonly requestService: RequestService,
    private readonly awsSqsService: AwsSqsService,
  ) {
    this.queues = this.configService.get<AwsSqsModuleOptions>(AWS_SQS_CONFIG).queues;
  }

  async execute(): Promise<void> {
    try {
      const total = await this.requestService.count({
        partitionKey: { status: RequestStatus.DONE },
        queryOptions: { queryIndex: statusUpdatedAtIndex },
      });

      const limit = LIMIT;
      let offset = 0;
      let cursor: unknown;
      while (offset < total) {
        const requests = await this.requestService.find({
          partitionKey: { status: RequestStatus.DONE },
          queryOptions: { queryIndex: statusUpdatedAtIndex, limit, cursor },
        });

        await Promise.all(
          requests.items.map(async request => {
            try {
              await this.awsSqsService.send(
                new SendMessageCommand({
                  QueueUrl: this.queues[AwsSqsQueue.WEATHER_REQUESTS],
                  MessageBody: JSON.stringify(request),
                }),
              );
              await this.requestService.update({
                primaryKeyAttributes: { id: request.id },
                body: { status: RequestStatus.QUEUED },
              });
            } catch (err) {
              this.logger.error(err);
              await this.requestService.update({
                primaryKeyAttributes: { id: request.id },
                body: { status: RequestStatus.FAILED, updatedAt: new Date().valueOf() },
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
