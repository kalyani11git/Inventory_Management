import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../common/roles';
import { ProductStatus } from '../common/product-status';

export class UserPublicDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'Kalyani Mali' })
  name: string;

  @ApiProperty({ example: 'kalyani@example.com' })
  email: string;

  @ApiProperty({ enum: UserRole, example: UserRole.USER })
  role: UserRole;

  @ApiPropertyOptional({ example: '2026-09-10T18:00:00.000Z' })
  createdAt?: string;
}

export class AuthResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({ type: UserPublicDto })
  user: UserPublicDto;
}

export class MeResponseDto {
  @ApiProperty({ type: UserPublicDto })
  user: UserPublicDto;
}

export class MessageResponseDto {
  @ApiProperty({ example: 'Logged out' })
  message: string;
}

export class CategoryResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'Electronics' })
  name: string;

  @ApiPropertyOptional({ example: 'Phones and accessories', nullable: true })
  description: string | null;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}

export class ProductResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'USB Cable' })
  name: string;

  @ApiProperty({ example: 'USB-001' })
  sku: string;

  @ApiPropertyOptional({ nullable: true })
  description: string | null;

  @ApiProperty({ example: 25 })
  quantity: number;

  @ApiProperty({ example: 149.5 })
  unitPrice: number;

  @ApiPropertyOptional({ example: 'ABC Traders', nullable: true })
  supplierName: string | null;

  @ApiProperty({ enum: ProductStatus, example: ProductStatus.IN_STOCK })
  status: ProductStatus;

  @ApiPropertyOptional({ nullable: true })
  imageUrl: string | null;

  @ApiProperty()
  categoryId: string;

  @ApiPropertyOptional({ type: CategoryResponseDto })
  category?: CategoryResponseDto;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}

export class ProductListResponseDto {
  @ApiProperty({ type: [ProductResponseDto] })
  data: ProductResponseDto[];

  @ApiProperty({ example: 12 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 2 })
  totalPages: number;
}

export class UserAccountStatsDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty()
  createdAt: string;

  @ApiProperty({ example: 4 })
  productCount: number;

  @ApiProperty({ example: 2 })
  categoryCount: number;

  @ApiProperty({ example: 80 })
  stockQuantity: number;
}

export class UserAnalyticsDto {
  @ApiProperty({ example: 4 })
  totalUsers: number;

  @ApiProperty({ example: 1 })
  owners: number;

  @ApiProperty({ example: 3 })
  members: number;

  @ApiProperty({ example: 1 })
  joinedThisWeek: number;

  @ApiProperty({ example: 3 })
  joinedThisMonth: number;

  @ApiProperty({ example: 2 })
  withInventory: number;

  @ApiProperty({ example: 2 })
  withoutInventory: number;

  @ApiProperty({ example: 3.5 })
  avgProductsPerUser: number;

  @ApiProperty({ type: [UserAccountStatsDto] })
  accounts: UserAccountStatsDto[];
}

export class DashboardStatsDto {
  @ApiProperty({ example: 12 })
  totalProducts: number;

  @ApiProperty({ example: 3 })
  totalCategories: number;

  @ApiProperty({ example: 340 })
  totalStockQuantity: number;

  @ApiProperty({ example: 2 })
  lowStockItems: number;

  @ApiProperty({ example: 1 })
  outOfStockItems: number;

  @ApiPropertyOptional({ type: UserAnalyticsDto, nullable: true })
  userAnalytics: UserAnalyticsDto | null;
}

export class ErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
    example: 'SKU must be unique',
  })
  message: string | string[];

  @ApiProperty({ example: 'Bad Request' })
  error: string;
}
