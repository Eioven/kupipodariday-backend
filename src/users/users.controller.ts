import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindUsersDto } from './dto/find-users.dto';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';
import { UserPublicProfileResponseDto } from './dto/user-public-profile-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async findOwn(@CurrentUser() user: User): Promise<UserProfileResponseDto> {
    const fullUser = await this.usersService.findById(user.id);
    if (!fullUser) {
      throw new NotFoundException('User not found');
    }
    return new UserProfileResponseDto(fullUser);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async update(
    @CurrentUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserProfileResponseDto> {
    const updatedUser = await this.usersService.update(user.id, updateUserDto);
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
    return new UserProfileResponseDto(updatedUser);
  }

  @Get('me/wishes')
  @UseGuards(JwtAuthGuard)
  async getOwnWishes(@CurrentUser() user: User) {
    return await this.usersService.getOwnWishes(user.id);
  }

  @Get(':username')
  @UseGuards(JwtAuthGuard)
  async findOne(
    @Param('username') username: string,
  ): Promise<UserPublicProfileResponseDto> {
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return new UserPublicProfileResponseDto(user);
  }

  @Get(':username/wishes')
  @UseGuards(JwtAuthGuard)
  async getWishes(@Param('username') username: string) {
    return await this.usersService.getUserWishes(username);
  }

  @Post('find')
  @UseGuards(JwtAuthGuard)
  async findMany(
    @Body() findUsersDto: FindUsersDto,
  ): Promise<UserProfileResponseDto[]> {
    const users = await this.usersService.findMany(findUsersDto);
    return users.map((user) => new UserProfileResponseDto(user));
  }
}
