import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import { InventoryModule } from 'src/inventory/inventory.module';
import { PromotionsModule } from 'src/promotions/promotions.module';
import { TokensModule } from 'src/tokens/tokens.module';
import { Order } from './order.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    ConfigModule,
    InventoryModule,
    PromotionsModule,
    TokensModule,
    LoggerModule,
  ],
  exports: [TypeOrmModule],
  providers: [OrdersService, Logger],
  controllers: [OrdersController],
})
export class OrdersModule {}
