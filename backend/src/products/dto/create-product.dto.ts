import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'USB Cable' })
  @IsString()
  @IsNotEmpty({ message: 'Product name is required' })
  @MaxLength(120)
  name: string;

  @ApiProperty({ example: 'USB-001', description: 'Must be unique' })
  @IsString()
  @IsNotEmpty({ message: 'SKU is required' })
  @MaxLength(50)
  sku: string;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'Please select a valid category' })
  categoryId: string;

  @ApiPropertyOptional({ example: '1 meter cable' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ example: 25, minimum: 0 })
  @IsNumber({}, { message: 'Quantity must be a number' })
  @Min(0, { message: 'Quantity cannot be negative' })
  quantity: number;

  @ApiProperty({ example: 149.5, minimum: 0.01 })
  @IsNumber({}, { message: 'Unit price must be a number' })
  @Min(0.01, { message: 'Price must be greater than 0' })
  unitPrice: number;

  @ApiPropertyOptional({ example: 'ABC Traders' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  supplierName?: string;
}
