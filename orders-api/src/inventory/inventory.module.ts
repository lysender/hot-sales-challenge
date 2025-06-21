import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryController } from './inventory.controller';
import { Inventory } from './inventory.entity';
import { InventoryService } from './inventory.service';
import { Product } from './product.entity';
import { ProductsService } from './products.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Inventory]), ConfigModule],
  exports: [TypeOrmModule],
  controllers: [InventoryController],
  providers: [ProductsService, InventoryService],
})
export class InventoryModule {}
