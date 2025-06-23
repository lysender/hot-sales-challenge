import { ApiProperty } from '@nestjs/swagger';

export class CachedInventoryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  quantity: number;
}
