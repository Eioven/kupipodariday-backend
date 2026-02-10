import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Offer } from './entities/offer.entity';
import { CreateOfferDto } from './dto/create-offer.dto';
import { WishesService } from '../wishes/wishes.service';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private offersRepository: Repository<Offer>,
    private wishesService: WishesService,
  ) {}

  // Standard CRUD: Create
  async create(createOfferDto: CreateOfferDto, userId: number): Promise<Offer> {
    const { itemId, amount, hidden } = createOfferDto;

    const wish = await this.wishesService.findById(itemId);

    if (!wish) {
      throw new NotFoundException('Wish not found');
    }

    if (wish.owner.id === userId) {
      throw new ForbiddenException('You cannot contribute to your own wish');
    }

    const newRaised = Number(wish.raised) + Number(amount);
    if (newRaised > Number(wish.price)) {
      throw new ForbiddenException(
        'The total raised amount exceeds the wish price',
      );
    }

    const offer = this.offersRepository.create({
      amount,
      hidden: hidden || false,
      item: { id: itemId },
      user: { id: userId },
    });

    const savedOffer = await this.offersRepository.save(offer);

    // Update wish raised amount using internal method
    await this.wishesService.updateRaisedAmount(itemId, newRaised);

    return savedOffer;
  }

  // Standard CRUD: Find one by query filter
  async findOne(query: FindOptionsWhere<Offer>): Promise<Offer | null> {
    return await this.offersRepository.findOne({
      where: query,
      relations: ['item', 'user', 'item.owner'],
    });
  }

  // Standard CRUD: Find multiple by query filter
  async find(query: FindOptionsWhere<Offer>): Promise<Offer[]> {
    return await this.offersRepository.find({
      where: query,
      relations: ['item', 'user', 'item.owner'],
    });
  }

  // Standard CRUD: Update one by query filter
  async updateOne(
    query: FindOptionsWhere<Offer>,
    updateData: Partial<Offer>,
  ): Promise<Offer | null> {
    const offer = await this.findOne(query);
    if (!offer) {
      return null;
    }
    await this.offersRepository.update(offer.id, updateData);
    return await this.findOne(query);
  }

  // Standard CRUD: Remove one by query filter
  async removeOne(query: FindOptionsWhere<Offer>): Promise<Offer | null> {
    const offer = await this.findOne(query);
    if (!offer) {
      return null;
    }
    await this.offersRepository.remove(offer);
    return offer;
  }

  // Legacy methods for backward compatibility
  async findById(id: number): Promise<Offer | null> {
    return await this.findOne({ id } as FindOptionsWhere<Offer>);
  }

  async findAll(userId: number): Promise<Offer[]> {
    return await this.find({ user: { id: userId } } as FindOptionsWhere<Offer>);
  }
}
