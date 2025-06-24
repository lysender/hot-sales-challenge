import assert from 'node:assert/strict';
import {
  Body,
  Controller,
  HttpCode,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AuthRequest } from 'src/auth/types/auth-request.type';
import { SubmitOrderDto } from './dto/submit-order.dto';
import { Order } from './order.entity';
import { OrdersService } from './orders.service';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @HttpCode(200)
  @Post('placeOrderSimple')
  async placeOrderSimple(
    @Request() req: AuthRequest,
    @Body() body: SubmitOrderDto,
  ): Promise<Order> {
    assert.ok(req.user, 'request user is required');
    return await this.ordersService.placeOrderSimple(req.user.id, body);
  }
}
