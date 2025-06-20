import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Nullable } from 'src/shared/nullable';
import { Repository } from 'typeorm';
import { Promotion } from './promotion.entity';

@Injectable()
export class PromotionsService {
  constructor(
    @InjectRepository(Promotion)
    private repository: Repository<Promotion>,
  ) {}

  findAll(): Promise<Promotion[]> {
    return this.repository.find();
  }

  findOne(id: string): Promise<Nullable<Promotion>> {
    return this.repository.findOneBy({ id });
  }

  async remove(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
