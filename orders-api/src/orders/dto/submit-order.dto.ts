import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class SubmitOrderDto {
  @ApiProperty()
  @IsUUID('7')
  promotionId: string;

  @ApiProperty()
  @IsUUID('7')
  productId: string;
}
