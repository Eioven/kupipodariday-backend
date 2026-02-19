import {
  IsNumber,
  IsInt,
  IsString,
  IsDate,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Exclude } from 'class-transformer';

export class UserPublicProfileResponseDto {
  @IsNumber()
  @IsInt()
  id: number;

  @IsString()
  @MinLength(1)
  @MaxLength(64)
  username: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  about: string;

  @IsString()
  avatar: string;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  @Exclude()
  email: string;

  @Exclude()
  password: string;

  constructor(partial: Partial<UserPublicProfileResponseDto>) {
    Object.assign(this, partial);
  }
}
