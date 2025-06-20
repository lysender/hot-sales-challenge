import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Nullable } from 'src/shared/nullable';
import { Repository } from 'typeorm';
import { Order } from './order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private usersRepository: Repository<Order>,
  ) {}

  findAll(): Promise<Order[]> {
    return this.usersRepository.find();
  }

  findOne(id: string): Promise<Nullable<Order>> {
    return this.usersRepository.findOneBy({ id });
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
