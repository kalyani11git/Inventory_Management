import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, Min } from 'class-validator';

export class AdjustStockDto {
  @ApiProperty({ enum: ['increase', 'decrease'] })
  @IsEnum(['increase', 'decrease'], {
    message: 'Type must be increase or decrease',
  })
  type: 'increase' | 'decrease';

  @ApiProperty({ example: 5, minimum: 1 })
  @IsInt({ message: 'Quantity must be a whole number' })
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;
}
