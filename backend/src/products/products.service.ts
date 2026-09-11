import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { Category } from '../categories/category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { getStockStatus } from '../common/product-status';
import { AuthUser, isOwner } from '../common/roles';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
  ) {}

  private async ensureCategory(user: AuthUser, categoryId: string) {
    const category = await this.categoryRepo.findOne({
      where: { id: categoryId, userId: user.id },
    });
    if (!category) {
      throw new BadRequestException('Category not found');
    }
    return category;
  }

  async create(user: AuthUser, dto: CreateProductDto) {
    const sku = dto.sku.trim().toUpperCase();
    const existingSku = await this.productRepo.findOne({ where: { sku } });
    if (existingSku) {
      throw new ConflictException('SKU must be unique');
    }

    await this.ensureCategory(user, dto.categoryId);

    const quantity = Math.floor(dto.quantity);
    const product = this.productRepo.create({
      name: dto.name.trim(),
      sku,
      categoryId: dto.categoryId,
      description: dto.description?.trim() || null,
      quantity,
      unitPrice: dto.unitPrice,
      supplierName: dto.supplierName?.trim() || null,
      status: getStockStatus(quantity),
      userId: user.id,
    });

    return this.productRepo.save(product);
  }

  async findAll(user: AuthUser, query: QueryProductsDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'DESC';

    const qb = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category');

    if (!isOwner(user)) {
      qb.where('product.userId = :userId', { userId: user.id });
    }

    if (query.search) {
      const term = `%${query.search.trim()}%`;
      qb.andWhere('(product.name ILIKE :term OR product.sku ILIKE :term)', {
        term,
      });
    }

    if (query.categoryId) {
      qb.andWhere('product.categoryId = :categoryId', {
        categoryId: query.categoryId,
      });
    }

    if (query.status) {
      qb.andWhere('product.status = :status', { status: query.status });
    }

    qb.orderBy(`product.${sortBy}`, sortOrder);
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findOne(user: AuthUser, id: string) {
    const product = await this.productRepo.findOne({
      where: { id, userId: user.id },
      relations: ['category'],
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async update(user: AuthUser, id: string, dto: UpdateProductDto) {
    const product = await this.findOne(user, id);

    if (dto.sku) {
      const sku = dto.sku.trim().toUpperCase();
      const existingSku = await this.productRepo.findOne({ where: { sku } });
      if (existingSku && existingSku.id !== id) {
        throw new ConflictException('SKU must be unique');
      }
      product.sku = sku;
    }

    if (dto.categoryId) {
      await this.ensureCategory(user, dto.categoryId);
      product.categoryId = dto.categoryId;
    }

    if (dto.name) product.name = dto.name.trim();
    if (dto.description !== undefined) {
      product.description = dto.description?.trim() || null;
    }
    if (dto.supplierName !== undefined) {
      product.supplierName = dto.supplierName?.trim() || null;
    }
    if (dto.unitPrice !== undefined) product.unitPrice = dto.unitPrice;
    if (dto.quantity !== undefined) {
      product.quantity = Math.floor(dto.quantity);
      product.status = getStockStatus(product.quantity);
    }

    await this.productRepo.save(product);
    return this.findOne(user, id);
  }

  async remove(user: AuthUser, id: string) {
    const product = await this.findOne(user, id);
    await this.productRepo.remove(product);
    return { message: 'Product deleted' };
  }

  async adjustStock(user: AuthUser, id: string, dto: AdjustStockDto) {
    const product = await this.findOne(user, id);
    let nextQty = product.quantity;

    if (dto.type === 'increase') {
      nextQty = product.quantity + dto.quantity;
    } else {
      nextQty = product.quantity - dto.quantity;
      if (nextQty < 0) {
        throw new BadRequestException('Stock cannot go below 0');
      }
    }

    product.quantity = nextQty;
    product.status = getStockStatus(nextQty);
    await this.productRepo.save(product);
    return this.findOne(user, id);
  }

  async saveImage(user: AuthUser, id: string, filename: string) {
    const product = await this.findOne(user, id);
    product.imageUrl = `/uploads/${filename}`;
    await this.productRepo.save(product);
    return this.findOne(user, id);
  }
}
