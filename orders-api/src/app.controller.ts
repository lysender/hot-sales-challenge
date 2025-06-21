import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ServiceNameDto } from './shared/service-name.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getServiceName(): ServiceNameDto {
    return this.appService.getServiceName();
  }
}
