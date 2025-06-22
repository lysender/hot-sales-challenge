import assert from 'node:assert/strict';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AuthRequest } from 'src/auth/types/auth-request.type';
import { OrderTokenDataDto } from './dto/order-token-data.dto';
import { OrderTokenDto } from './dto/order-token.dto';
import { SubmitOrderDto } from './dto/submit-order.dto';
import { Order } from './order.entity';
import { OrdersService } from './orders.service';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @HttpCode(200)
  @Post('placeOrder')
  async placeOrder(
    @Request() req: AuthRequest,
    @Body() body: SubmitOrderDto,
  ): Promise<OrderTokenDto> {
    assert.ok(req.user, 'request user is required');
    return await this.ordersService.placeOrder(req.user.id, body);
  }

  @HttpCode(200)
  @Post('placeOrderSimple')
  async placeOrderSimple(
    @Request() req: AuthRequest,
    @Body() body: SubmitOrderDto,
  ): Promise<Order> {
    assert.ok(req.user, 'request user is required');
    return await this.ordersService.placeOrderSimple(req.user.id, body);
  }

  @HttpCode(200)
  @Get('checkOrder')
  async checkOrder(
    @Request() req: AuthRequest,
    @Query() query: OrderTokenDto,
  ): Promise<OrderTokenDataDto> {
    assert.ok(req.user, 'request user is required');
    return await this.ordersService.checkOrder(req.user.id, query.orderToken);
  }
}
