import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { Product } from '../products/product.entity';
import { Category } from '../categories/category.entity';
import { User } from '../users/user.entity';
import { ProductStatus } from '../common/product-status';
import { AuthUser, UserRole, isOwner } from '../common/roles';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async getStats(user: AuthUser) {
    if (isOwner(user)) {
      return {
        totalProducts: 0,
        totalCategories: 0,
        totalStockQuantity: 0,
        lowStockItems: 0,
        outOfStockItems: 0,
        userAnalytics: await this.getUserAnalytics(),
      };
    }

    const where = { userId: user.id };
    const qtyQb = this.productRepo
      .createQueryBuilder('p')
      .select('COALESCE(SUM(p.quantity), 0)', 'total')
      .where('p.userId = :userId', { userId: user.id });

    const [totalProducts, totalCategories, qtyRow, lowStock, outOfStock] =
      await Promise.all([
        this.productRepo.count({ where }),
        this.categoryRepo.count({ where }),
        qtyQb.getRawOne(),
        this.productRepo.count({
          where: { ...where, status: ProductStatus.LOW_STOCK },
        }),
        this.productRepo.count({
          where: { ...where, status: ProductStatus.OUT_OF_STOCK },
        }),
      ]);

    return {
      totalProducts,
      totalCategories,
      totalStockQuantity: parseInt(qtyRow?.total || '0', 10),
      lowStockItems: lowStock,
      outOfStockItems: outOfStock,
      userAnalytics: null,
    };
  }

  private async getUserAnalytics() {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      owners,
      joinedThisWeek,
      joinedThisMonth,
      users,
      productRows,
      categoryRows,
    ] = await Promise.all([
      this.userRepo.count(),
      this.userRepo.count({ where: { role: UserRole.OWNER } }),
      this.userRepo.count({
        where: { createdAt: MoreThanOrEqual(weekAgo) },
      }),
      this.userRepo.count({
        where: { createdAt: MoreThanOrEqual(monthStart) },
      }),
      this.userRepo.find({
        order: { createdAt: 'DESC' },
        select: ['id', 'name', 'email', 'role', 'createdAt'],
      }),
      this.productRepo
        .createQueryBuilder('p')
        .select('p.userId', 'userId')
        .addSelect('COUNT(*)', 'productCount')
        .addSelect('COALESCE(SUM(p.quantity), 0)', 'stockQuantity')
        .groupBy('p.userId')
        .getRawMany<{
          userId: string;
          productCount: string;
          stockQuantity: string;
        }>(),
      this.categoryRepo
        .createQueryBuilder('c')
        .select('c.userId', 'userId')
        .addSelect('COUNT(*)', 'categoryCount')
        .groupBy('c.userId')
        .getRawMany<{ userId: string; categoryCount: string }>(),
    ]);

    const productByUser = new Map(
      productRows.map((row) => [
        row.userId,
        {
          productCount: parseInt(row.productCount || '0', 10),
          stockQuantity: parseInt(row.stockQuantity || '0', 10),
        },
      ]),
    );
    const categoryByUser = new Map(
      categoryRows.map((row) => [
        row.userId,
        parseInt(row.categoryCount || '0', 10),
      ]),
    );

    const accounts = users.map((u) => {
      const products = productByUser.get(u.id);
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
        productCount: products?.productCount || 0,
        categoryCount: categoryByUser.get(u.id) || 0,
        stockQuantity: products?.stockQuantity || 0,
      };
    });

    const withInventory = accounts.filter((u) => u.productCount > 0).length;
    const totalProducts = accounts.reduce((sum, u) => sum + u.productCount, 0);

    return {
      totalUsers,
      owners,
      members: totalUsers - owners,
      joinedThisWeek,
      joinedThisMonth,
      withInventory,
      withoutInventory: totalUsers - withInventory,
      avgProductsPerUser:
        totalUsers === 0
          ? 0
          : Math.round((totalProducts / totalUsers) * 10) / 10,
      accounts,
    };
  }
}
