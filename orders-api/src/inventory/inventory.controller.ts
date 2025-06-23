import {
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { IdParamDto } from 'src/auth/dto/id-param.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { MessageDto } from 'src/shared/dto/message.dto';
import { CachedInventoryDto } from './dto/cached-inventory.dto';
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

  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @Post('populateCache')
  async populateCache(): Promise<MessageDto> {
    await this.inventoryService.populateCache();
    return { message: 'Inventory cache populated' };
  }

  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @Get('listCache')
  async listCache(): Promise<CachedInventoryDto[]> {
    return await this.inventoryService.listCachedInventory();
  }

  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @Get('getCache/:id')
  async getCache(@Param() param: IdParamDto): Promise<CachedInventoryDto> {
    return await this.inventoryService.getCachedInventory(param.id);
  }

  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @Post('decrCache/:id')
  async decrCache(@Param() param: IdParamDto): Promise<string> {
    await this.inventoryService.decrCachedInventory(param.id);
    return '';
  }
}
