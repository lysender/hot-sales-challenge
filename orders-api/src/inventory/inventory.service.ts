import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Nullable } from 'src/shared/nullable';
import { Repository } from 'typeorm';
import { Inventory } from './inventory.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private repository: Repository<Inventory>,
  ) {}

  findAll(): Promise<Inventory[]> {
    return this.repository.find();
  }

  findOne(id: string): Promise<Nullable<Inventory>> {
    return this.repository.findOneBy({ id });
  }

  async remove(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
