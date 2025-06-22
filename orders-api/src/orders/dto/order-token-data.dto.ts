import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { OrderStatus } from '../types/order-status.type';

export class OrderTokenDataDto {
  @ApiProperty()
  @IsUUID('7')
  sub: string;

  @ApiProperty()
  @IsNotEmpty()
  customerId: number;

  @ApiProperty()
  @IsUUID('7')
  promotionId: string;

  @ApiProperty()
  @IsUUID('7')
  productId: string;

  @ApiProperty()
  @IsNotEmpty()
  status: OrderStatus;
}
