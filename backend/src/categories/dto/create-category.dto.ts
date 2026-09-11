import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Electronics' })
  @IsString()
  @IsNotEmpty({ message: 'Category name is required' })
  @MaxLength(80)
  name: string;

  @ApiPropertyOptional({ example: 'Phones and accessories' })
  @IsOptional()
  @IsString()
  @MaxLength(250)
  description?: string;
}
