import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import { RedisModule } from 'src/redis/redis.module';
import { RedisService } from 'src/redis/redis.service';
import { InventoryController } from './inventory.controller';
import { Inventory } from './inventory.entity';
import { InventoryService } from './inventory.service';
import { Product } from './product.entity';
import { ProductsService } from './products.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Inventory]),
    ConfigModule,
    RedisModule,
    LoggerModule,
  ],
  exports: [TypeOrmModule],
  controllers: [InventoryController],
  providers: [ProductsService, InventoryService, RedisService, Logger],
})
export class InventoryModule {}
