import { Injectable } from '@nestjs/common';
import { ServiceNameDto } from './shared/service-name.dto';

@Injectable()
export class AppService {
  getServiceName(): ServiceNameDto {
    return {
      name: 'orders-service',
      version: '0.1.0',
    };
  }
}
