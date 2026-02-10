import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { WishesService } from '../wishes/wishes.service';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistsRepository: Repository<Wishlist>,
    private wishesService: WishesService,
  ) {}

  // Standard CRUD: Create
  async create(
    createWishlistDto: CreateWishlistDto,
    userId: number,
  ): Promise<Wishlist> {
    const { name, image, itemsId } = createWishlistDto;

    const items = await this.wishesService.findByIds(itemsId);

    const wishlist = this.wishlistsRepository.create({
      name,
      image,
      owner: { id: userId },
      items,
    });

    return await this.wishlistsRepository.save(wishlist);
  }

  // Standard CRUD: Find one by query filter
  async findOne(query: FindOptionsWhere<Wishlist>): Promise<Wishlist | null> {
    return await this.wishlistsRepository.findOne({
      where: query,
      relations: ['owner', 'items', 'items.owner'],
    });
  }

  // Standard CRUD: Find multiple by query filter
  async find(query: FindOptionsWhere<Wishlist>): Promise<Wishlist[]> {
    return await this.wishlistsRepository.find({
      where: query,
      relations: ['owner', 'items', 'items.owner'],
    });
  }

  // Standard CRUD: Update one by query filter
  async updateOne(
    query: FindOptionsWhere<Wishlist>,
    updateWishlistDto: UpdateWishlistDto,
    userId?: number,
  ): Promise<Wishlist | null> {
    const wishlist = await this.findOne(query);

    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }

    if (userId && wishlist.owner.id !== userId) {
      throw new ForbiddenException('You can only update your own wishlists');
    }

    const { itemsId, ...updateData } = updateWishlistDto;

    if (itemsId) {
      const items = await this.wishesService.findByIds(itemsId);
      wishlist.items = items;
    }

    Object.assign(wishlist, updateData);

    await this.wishlistsRepository.save(wishlist);
    return await this.findOne(query);
  }

  // Standard CRUD: Remove one by query filter
  async removeOne(
    query: FindOptionsWhere<Wishlist>,
    userId?: number,
  ): Promise<Wishlist> {
    const wishlist = await this.findOne(query);

    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }

    if (userId && wishlist.owner.id !== userId) {
      throw new ForbiddenException('You can only delete your own wishlists');
    }

    await this.wishlistsRepository.remove(wishlist);
    return wishlist;
  }

  // Legacy methods for backward compatibility
  async findById(id: number): Promise<Wishlist | null> {
    return await this.findOne({ id } as FindOptionsWhere<Wishlist>);
  }

  async findAll(): Promise<Wishlist[]> {
    return await this.wishlistsRepository.find({
      relations: ['owner', 'items'],
    });
  }

  async update(
    id: number,
    updateWishlistDto: UpdateWishlistDto,
    userId: number,
  ): Promise<Wishlist | null> {
    return await this.updateOne(
      { id } as FindOptionsWhere<Wishlist>,
      updateWishlistDto,
      userId,
    );
  }

  async remove(id: number, userId: number): Promise<Wishlist> {
    return await this.removeOne({ id } as FindOptionsWhere<Wishlist>, userId);
  }
}
