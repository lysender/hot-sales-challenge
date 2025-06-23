import { BullModule } from '@nestjs/bullmq';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import { InventoryModule } from 'src/inventory/inventory.module';
import { PromotionsModule } from 'src/promotions/promotions.module';
import { RedisModule } from 'src/redis/redis.module';
import { RedisService } from 'src/redis/redis.service';
import { TokensModule } from 'src/tokens/tokens.module';
import { Order } from './order.entity';
import { OrdersConsumer } from './orders.consumer';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    BullModule.registerQueue({
      name: 'orders',
    }),
    ConfigModule,
    InventoryModule,
    PromotionsModule,
    TokensModule,
    RedisModule,
    LoggerModule,
  ],
  exports: [TypeOrmModule],
  providers: [OrdersService, OrdersConsumer, RedisService, Logger],
  controllers: [OrdersController],
})
export class OrdersModule {}
