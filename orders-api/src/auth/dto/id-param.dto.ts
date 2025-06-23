import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class IdParamDto {
  @ApiProperty()
  @IsNotEmpty()
  id: string;
}
