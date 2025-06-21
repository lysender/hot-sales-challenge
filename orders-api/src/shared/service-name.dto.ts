import { ApiProperty } from '@nestjs/swagger';

export class ServiceNameDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  version: string;
}
