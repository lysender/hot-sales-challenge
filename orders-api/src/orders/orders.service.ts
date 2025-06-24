import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Inventory } from 'src/inventory/inventory.entity';
import { Promotion } from 'src/promotions/promotion.entity';
import { Nullable } from 'src/shared/nullable';
import { DataSource, Repository } from 'typeorm';
import { v7 } from 'uuid';
import { SubmitOrderDto } from './dto/submit-order.dto';
import { Order } from './order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,

    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,

    @InjectRepository(Promotion)
    private promotionsRepository: Repository<Promotion>,

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

  async placeOrderSimple(
    customerId: number,
    payload: SubmitOrderDto,
  ): Promise<Order> {
    // Validate promotion and product
    const [promotion, inventory, existingOrder] = await Promise.all([
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
    if (existingOrder) {
      throw new BadRequestException('You already purchased this product');
    }

    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();

    let error: Nullable<Error> = null;
    let order: Nullable<Order> = null;

    try {
      // Validate inventory and secure the slot
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
        id: v7(),
        customerId: customerId,
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
}
