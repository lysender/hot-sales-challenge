import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RedisService } from 'src/redis/redis.service';
import { Nullable } from 'src/shared/nullable';
import { Repository } from 'typeorm';
import { CachedInventoryDto } from './dto/cached-inventory.dto';
import { Inventory } from './inventory.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private repository: Repository<Inventory>,

    private redisService: RedisService,
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

  async populateCache() {
    // Populate redis cache
    const items = await this.repository.find();
    for (const item of items) {
      const key = `item:${item.id}`;
      await this.redisService.setValue(key, item.quantity);
    }
  }

  async listCachedInventory(): Promise<CachedInventoryDto[]> {
    const items = await this.repository.find();
    const cachedItems: CachedInventoryDto[] = [];
    for (const item of items) {
      const key = `item:${item.id}`;
      const res = await this.redisService.getValue(key);
      if (res) {
        cachedItems.push({
          id: item.id,
          quantity: res,
        });
      }
    }

    return cachedItems;
  }

  async getCachedInventory(id: string): Promise<CachedInventoryDto> {
    const key = `item:${id}`;
    const res = await this.redisService.getValue(key);
    if (res) {
      return {
        id,
        quantity: res,
      };
    }
    throw new NotFoundException('Cached inventory not found');
  }

  async decrCachedInventory(id: string) {
    const key = `item:${id}`;
    const res = await this.redisService.decrQuantity(key);
    console.log(res);
  }
}
