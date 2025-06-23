import { InjectQueue } from '@nestjs/bullmq';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import { Inventory } from 'src/inventory/inventory.entity';
import { Promotion } from 'src/promotions/promotion.entity';
import { RedisService } from 'src/redis/redis.service';
import { Nullable } from 'src/shared/nullable';
import { TokensService } from 'src/tokens/tokens.service';
import { DataSource, Repository } from 'typeorm';
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

    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,

    @InjectRepository(Promotion)
    private promotionsRepository: Repository<Promotion>,

    @InjectQueue('orders') private ordersQueue: Queue,

    private tokensService: TokensService,
    private redisService: RedisService,
    private dataSource: DataSource,
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
    const [promotion, inventory, order] = await Promise.all([
      this.promotionsRepository.findOneBy({ id: payload.promotionId }),
      this.inventoryRepository.findOneBy({ id: payload.productId }),
      this.ordersRepository.findOneBy({
        promotionId: payload.promotionId,
        productId: payload.productId,
        customerId,
      }),
    ]);

    if (!promotion) {
      throw new BadRequestException('Invalid promotion');
    }
    if (!inventory) {
      throw new BadRequestException('Invalid product');
    }
    if (order) {
      throw new BadRequestException('You already purchased this product');
    }

    // Secure purchase order slot
    const key = `item:${payload.productId}`;
    const newQty = await this.redisService.decrQuantity(key);
    if (newQty < 0) {
      throw new ForbiddenException('Product is already out of stock');
    }

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

    await this.ordersQueue.add('placeOrder', tokenData);

    const orderToken = this.tokensService.sign(tokenData, DEFAULT_EXPIRES_IN);
    return { orderToken };
  }

  async processOrder(payload: OrderTokenDataDto): Promise<Order> {
    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();

    let error: Nullable<Error> = null;
    let order: Nullable<Order> = null;

    try {
      // Validate inventory
      const qtyRes = await runner.manager
        .createQueryBuilder()
        .update(Inventory)
        .set({ quantity: () => 'quantity - 1' })
        .where('id = :id AND quantity > 0', { id: payload.productId })
        .execute();

      let qtyUpdated = false;

      if (qtyRes.affected && qtyRes.affected > 0) {
        qtyUpdated = true;
      }

      if (!qtyUpdated) {
        throw new ForbiddenException('Product is out of stock');
      }

      // Insert new order
      const orderRepo = runner.manager.getRepository(Order);
      order = orderRepo.create({
        id: payload.sub,
        customerId: payload.customerId,
        promotionId: payload.promotionId,
        productId: payload.productId,
        status: 'success',
      });

      await orderRepo.save(order);

      await runner.commitTransaction();
    } catch (err) {
      await runner.rollbackTransaction();
      error = err;
    } finally {
      await runner.release();
    }

    if (error) {
      throw error;
    }
    if (order) {
      return order;
    }

    throw new Error('Unhandled...');
  }

  async placeOrderSimple(
    customerId: number,
    payload: SubmitOrderDto,
  ): Promise<Order> {
    // Validate promotion
    const [promotion, existingOrder] = await Promise.all([
      this.promotionsRepository.findOneBy({ id: payload.promotionId }),
      this.ordersRepository.findOneBy({
        promotionId: payload.promotionId,
        productId: payload.productId,
        customerId,
      }),
    ]);

    if (!promotion) {
      throw new BadRequestException('Invalid promotion');
    }
    if (existingOrder) {
      throw new BadRequestException('You already purchased this product');
    }

    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();

    let error: Nullable<Error> = null;
    let order: Nullable<Order> = null;

    try {
      // Validate inventory
      const inventoryRepo = runner.manager.getRepository(Inventory);
      const inventory = await inventoryRepo
        .createQueryBuilder('inventory')
        .setLock('pessimistic_write')
        .where('inventory.id = :id', { id: payload.productId })
        .getOne();

      if (!inventory) {
        throw new BadRequestException('Invalid product');
      }
      if (inventory.quantity <= 0) {
        throw new ForbiddenException('Product is out of stock');
      }

      // Decrease inventory quantity
      inventory.quantity = inventory.quantity - 1;
      await inventoryRepo.save(inventory);

      // Insert new order
      const orderRepo = runner.manager.getRepository(Order);
      order = orderRepo.create({
        id: v7(),
        customerId,
        promotionId: payload.promotionId,
        productId: payload.productId,
        status: 'success',
      });

      await orderRepo.save(order);

      await runner.commitTransaction();
    } catch (err) {
      await runner.rollbackTransaction();
      error = err;
    } finally {
      await runner.release();
    }

    if (error) {
      throw error;
    }
    if (order) {
      return order;
    }

    throw new Error('Unhandled...');
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

    if (order) {
      data.status = order.status as OrderStatus;
    }

    return data;
  }
}
