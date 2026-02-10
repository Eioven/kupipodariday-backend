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
import { WishesService } from './wishes.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createWishDto: CreateWishDto,
    @CurrentUser() user: User,
  ) {
    return await this.wishesService.create(createWishDto, user.id);
  }

  @Get('last')
  @UseGuards(JwtAuthGuard)
  async findLast() {
    return await this.wishesService.findLast();
  }

  @Get('top')
  @UseGuards(JwtAuthGuard)
  async findTop() {
    return await this.wishesService.findTop();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    const wish = await this.wishesService.findById(+id);
    if (!wish) {
      throw new NotFoundException('Wish not found');
    }
    return wish;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateWishDto: UpdateWishDto,
    @CurrentUser() user: User,
  ) {
    return await this.wishesService.update(+id, updateWishDto, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async removeOne(@Param('id') id: string, @CurrentUser() user: User) {
    return await this.wishesService.remove(+id, user.id);
  }

  @Post(':id/copy')
  @UseGuards(JwtAuthGuard)
  async copyWish(@Param('id') id: string, @CurrentUser() user: User) {
    return await this.wishesService.copyWish(+id, user.id);
  }
}
