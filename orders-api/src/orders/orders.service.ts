import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/inventory/product.entity';
import { Promotion } from 'src/promotions/promotion.entity';
import { Nullable } from 'src/shared/nullable';
import { TokensService } from 'src/tokens/tokens.service';
import { Repository } from 'typeorm';
import { v7 } from 'uuid';
import { OrderTokenDataDto } from './dto/order-token-data.dto';
import { OrderTokenDto } from './dto/order-token.dto';
import { SubmitOrderDto } from './dto/submit-order.dto';
import { Order } from './order.entity';
import { OrderStatus } from './types/order-status.type';

// Expires in 1 day
const DEFAULT_EXPIRES_IN = 60 * 60 * 24;

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,

    @InjectRepository(Product)
    private productsRepository: Repository<Product>,

    @InjectRepository(Promotion)
    private promotionsRepository: Repository<Promotion>,

    private tokensService: TokensService,
  ) {}

  findAll(): Promise<Order[]> {
    return this.ordersRepository.find();
  }

  findOne(id: string): Promise<Nullable<Order>> {
    return this.ordersRepository.findOneBy({ id });
  }

  async remove(id: string): Promise<void> {
    await this.ordersRepository.delete(id);
  }

  async placeOrder(
    customerId: number,
    payload: SubmitOrderDto,
  ): Promise<OrderTokenDto> {
    // Validate promotion and product
    const [promotion, product, order] = await Promise.all([
      this.promotionsRepository.findOneBy({ id: payload.promotionId }),
      this.productsRepository.findOneBy({ id: payload.productId }),
      this.ordersRepository.findOneBy({
        promotionId: payload.promotionId,
        productId: payload.productId,
        customerId,
      }),
    ]);

    if (!promotion) {
      throw new BadRequestException('Invalid promotion');
    }
    if (!product) {
      throw new BadRequestException('Invalid product');
    }
    if (order) {
      throw new BadRequestException('You already purchased this product');
    }

    // Validate if user already has an existing order
    // Secure purchase order slot
    const orderId = v7();
    // Send to queue
    // Return order token
    const tokenData: OrderTokenDataDto = {
      sub: orderId,
      customerId,
      promotionId: payload.promotionId,
      productId: payload.productId,
      status: 'pending',
    };

    const orderToken = this.tokensService.sign(tokenData, DEFAULT_EXPIRES_IN);
    return { orderToken };
  }

  async checkOrder(
    customerId: number,
    orderToken: string,
  ): Promise<OrderTokenDataDto> {
    const data = this.tokensService.verify<OrderTokenDataDto>(orderToken);
    if (!data) {
      throw new BadRequestException('Invalid order token');
    }

    if (data.customerId !== customerId) {
      throw new NotFoundException('Order not found');
    }

    // Check if the order is already placed
    const order = await this.ordersRepository.findOneBy({ id: data.sub });
    console.log(order);

    if (order) {
      data.status = order.status as OrderStatus;
    }

    return data;
  }
}
