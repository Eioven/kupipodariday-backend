import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindUsersDto } from './dto/find-users.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // Standard CRUD: Create
  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    return await this.usersRepository.save(user);
  }

  // Standard CRUD: Find one by query filter
  async findOne(query: FindOptionsWhere<User>): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: query,
      relations: ['wishes', 'offers', 'wishlists'],
    });
  }

  // Standard CRUD: Find multiple by query filter
  async find(query: FindOptionsWhere<User>): Promise<User[]> {
    return await this.usersRepository.find({
      where: query,
      relations: ['wishes', 'offers', 'wishlists'],
    });
  }

  // Standard CRUD: Update one by query filter
  async updateOne(
    query: FindOptionsWhere<User>,
    updateUserDto: UpdateUserDto,
  ): Promise<User | null> {
    const user = await this.findOne(query);
    if (!user) {
      return null;
    }

    // Hash password if it's being updated
    const updateData = { ...updateUserDto };
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    await this.usersRepository.update(user.id, updateData);
    return await this.findOne(query);
  }

  // Standard CRUD: Remove one by query filter
  async removeOne(query: FindOptionsWhere<User>): Promise<User | null> {
    const user = await this.findOne(query);
    if (!user) {
      return null;
    }
    await this.usersRepository.remove(user);
    return user;
  }

  // Legacy methods for backward compatibility
  async findById(id: number): Promise<User | null> {
    return await this.findOne({ id } as FindOptionsWhere<User>);
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.findOne({ username } as FindOptionsWhere<User>);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.findOne({ email } as FindOptionsWhere<User>);
  }

  async findMany(findUsersDto: FindUsersDto): Promise<User[]> {
    const { query } = findUsersDto;
    const escaped = query.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
    const searchPattern = `%${escaped}%`;
    return await this.usersRepository
      .createQueryBuilder('user')
      .where(
        'user.username ILIKE :pattern OR user.email ILIKE :pattern',
        { pattern: searchPattern },
      )
      .getMany();
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User | null> {
    return await this.updateOne(
      { id } as FindOptionsWhere<User>,
      updateUserDto,
    );
  }

  async getOwnWishes(userId: number) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['wishes'],
    });
    return user?.wishes || [];
  }

  async getUserWishes(username: string) {
    const user = await this.usersRepository.findOne({
      where: { username },
      relations: ['wishes', 'wishes.offers'],
    });
    return user?.wishes || [];
  }
}
