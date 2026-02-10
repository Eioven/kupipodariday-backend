import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Wish } from './entities/wish.entity';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private wishesRepository: Repository<Wish>,
  ) {}

  // Standard CRUD: Create
  async create(createWishDto: CreateWishDto, userId: number): Promise<Wish> {
    const wish = this.wishesRepository.create({
      ...createWishDto,
      owner: { id: userId },
    });
    return await this.wishesRepository.save(wish);
  }

  // Standard CRUD: Find one by query filter
  async findOne(query: FindOptionsWhere<Wish>): Promise<Wish | null> {
    return await this.wishesRepository.findOne({
      where: query,
      relations: ['owner', 'offers', 'offers.user'],
    });
  }

  // Standard CRUD: Find multiple by query filter
  async find(query: FindOptionsWhere<Wish>): Promise<Wish[]> {
    return await this.wishesRepository.find({
      where: query,
      relations: ['owner', 'offers', 'offers.user'],
    });
  }

  // Standard CRUD: Update one by query filter
  async updateOne(
    query: FindOptionsWhere<Wish>,
    updateWishDto: UpdateWishDto,
    userId?: number,
  ): Promise<Wish | null> {
    const wish = await this.findOne(query);

    if (!wish) {
      throw new NotFoundException('Wish not found');
    }

    if (userId && wish.owner.id !== userId) {
      throw new ForbiddenException('You can only update your own wishes');
    }

    if (wish.raised > 0 && updateWishDto.price) {
      throw new ForbiddenException(
        'Cannot update price when money has been raised',
      );
    }

    // Filter out 'raised' field to prevent direct updates
    // The 'raised' field should only be updated through offers
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { raised, ...safeUpdateData } = updateWishDto as Record<
      string,
      unknown
    >;

    await this.wishesRepository.update(wish.id, safeUpdateData as never);
    return await this.findOne(query);
  }

  // Standard CRUD: Remove one by query filter
  async removeOne(
    query: FindOptionsWhere<Wish>,
    userId?: number,
  ): Promise<Wish> {
    const wish = await this.findOne(query);

    if (!wish) {
      throw new NotFoundException('Wish not found');
    }

    if (userId && wish.owner.id !== userId) {
      throw new ForbiddenException('You can only delete your own wishes');
    }

    await this.wishesRepository.remove(wish);
    return wish;
  }

  // Legacy methods for backward compatibility
  async findById(id: number): Promise<Wish | null> {
    return await this.findOne({ id } as FindOptionsWhere<Wish>);
  }

  async findByIds(ids: number[]): Promise<Wish[]> {
    return await this.wishesRepository.findByIds(ids);
  }

  async findLast(): Promise<Wish[]> {
    return await this.wishesRepository.find({
      order: { createdAt: 'DESC' },
      take: 40,
      relations: ['owner', 'offers'],
    });
  }

  async findTop(): Promise<Wish[]> {
    return await this.wishesRepository.find({
      order: { copied: 'DESC' },
      take: 20,
      relations: ['owner', 'offers'],
    });
  }

  async update(
    id: number,
    updateWishDto: UpdateWishDto,
    userId: number,
  ): Promise<Wish | null> {
    return await this.updateOne(
      { id } as FindOptionsWhere<Wish>,
      updateWishDto,
      userId,
    );
  }

  async remove(id: number, userId: number): Promise<Wish> {
    return await this.removeOne({ id } as FindOptionsWhere<Wish>, userId);
  }

  async copyWish(id: number, userId: number): Promise<Wish> {
    const originalWish = await this.findById(id);

    if (!originalWish) {
      throw new NotFoundException('Wish not found');
    }

    // Increment copied counter
    await this.wishesRepository.increment({ id }, 'copied', 1);

    // Create a copy for the current user
    const copiedWish = this.wishesRepository.create({
      name: originalWish.name,
      link: originalWish.link,
      image: originalWish.image,
      price: originalWish.price,
      description: originalWish.description,
      owner: { id: userId },
    });

    return await this.wishesRepository.save(copiedWish);
  }

  // Internal method to update raised amount (used by offers service)
  async updateRaisedAmount(id: number, raised: number): Promise<void> {
    await this.wishesRepository.update(id, { raised });
  }
}
