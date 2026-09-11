import {
  Injectable,
  OnModuleInit,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UserRole } from '../common/roles';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.ensureOwnerExists();
  }

  async ensureOwnerExists() {
    await this.usersRepo
      .createQueryBuilder()
      .update(User)
      .set({ role: UserRole.OWNER })
      .where('role = :old', { old: 'admin' })
      .execute();

    const owner = await this.usersRepo.findOne({
      where: { role: UserRole.OWNER },
    });
    if (owner) return;

    const first = await this.usersRepo.find({
      order: { createdAt: 'ASC' },
      take: 1,
    });
    if (first[0]) {
      first[0].role = UserRole.OWNER;
      await this.usersRepo.save(first[0]);
    }
  }

  count() {
    return this.usersRepo.count();
  }

  findByEmail(email: string) {
    return this.usersRepo
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  findById(id: string) {
    return this.usersRepo.findOne({ where: { id } });
  }

  create(data: Partial<User>) {
    const user = this.usersRepo.create(data);
    return this.usersRepo.save(user);
  }

  findAll() {
    return this.usersRepo.find({
      order: { createdAt: 'ASC' },
      select: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt'],
    });
  }

  async updateRole(id: string, role: UserRole, actorId: string) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.id === actorId && role !== UserRole.OWNER) {
      throw new BadRequestException('You cannot remove your own owner role');
    }

    if (user.role === UserRole.OWNER && role === UserRole.USER) {
      const ownerCount = await this.usersRepo.count({
        where: { role: UserRole.OWNER },
      });
      if (ownerCount <= 1) {
        throw new BadRequestException('At least one owner is required');
      }
    }

    user.role = role;
    return this.usersRepo.save(user);
  }
}
