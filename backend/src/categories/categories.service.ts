import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { Product } from '../products/product.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AuthUser } from '../common/roles';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
  ) {}

  async create(user: AuthUser, dto: CreateCategoryDto) {
    const name = dto.name.trim();
    const exists = await this.categoryRepo.findOne({
      where: { userId: user.id, name },
    });
    if (exists) {
      throw new ConflictException('You already have a category with this name');
    }

    const category = this.categoryRepo.create({
      name,
      description: dto.description?.trim() || null,
      userId: user.id,
    });
    return this.categoryRepo.save(category);
  }

  findAll(user: AuthUser) {
    return this.categoryRepo.find({
      where: { userId: user.id },
      order: { name: 'ASC' },
    });
  }

  async findOne(user: AuthUser, id: string) {
    const category = await this.categoryRepo.findOne({
      where: { id, userId: user.id },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async update(user: AuthUser, id: string, dto: UpdateCategoryDto) {
    const category = await this.findOne(user, id);

    if (dto.name) {
      const name = dto.name.trim();
      const exists = await this.categoryRepo.findOne({
        where: { userId: user.id, name },
      });
      if (exists && exists.id !== id) {
        throw new ConflictException('You already have a category with this name');
      }
      category.name = name;
    }

    if (dto.description !== undefined) {
      category.description = dto.description?.trim() || null;
    }

    return this.categoryRepo.save(category);
  }

  async remove(user: AuthUser, id: string) {
    const category = await this.findOne(user, id);
    const count = await this.productRepo.count({ where: { categoryId: id } });
    if (count > 0) {
      throw new BadRequestException(
        'Cannot delete this category because products are still assigned to it',
      );
    }
    await this.categoryRepo.remove(category);
    return { message: 'Category deleted' };
  }
}
