import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString } from 'class-validator';

export class IdParamDto {
  @ApiProperty()
  @IsNumberString()
  id: string;
}
