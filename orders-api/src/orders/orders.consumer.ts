import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('orders')
export class OrdersConsumer extends WorkerHost {
  async process(job: Job<any, any, string>): Promise<any> {
    console.log(job);
    return {};
  }
}
