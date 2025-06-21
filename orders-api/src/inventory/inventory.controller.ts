import { Controller, Get, HttpCode, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Inventory } from './inventory.entity';
import { InventoryService } from './inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @Get()
  async listing(): Promise<Inventory[]> {
    return await this.inventoryService.findAll();
  }
}
