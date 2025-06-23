import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { OrdersService } from './orders.service';

@Processor('orders')
export class OrdersConsumer extends WorkerHost {
  constructor(private ordersService: OrdersService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    if (job.name === 'placeOrder') {
      await this.ordersService.processOrder(job.data);
    }
    return {};
  }
}
