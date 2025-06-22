import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class OrderTokenDto {
  @ApiProperty()
  @IsNotEmpty()
  orderToken: string;
}
