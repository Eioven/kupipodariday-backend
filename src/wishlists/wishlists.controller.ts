import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { WishlistsService } from './wishlists.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('wishlistlists')
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    return await this.wishlistsService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createWishlistDto: CreateWishlistDto,
    @CurrentUser() user: User,
  ) {
    return await this.wishlistsService.create(createWishlistDto, user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    const wishlist = await this.wishlistsService.findById(+id);
    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }
    return wishlist;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateWishlistDto: UpdateWishlistDto,
    @CurrentUser() user: User,
  ) {
    return await this.wishlistsService.update(+id, updateWishlistDto, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async removeOne(@Param('id') id: string, @CurrentUser() user: User) {
    return await this.wishlistsService.remove(+id, user.id);
  }
}
