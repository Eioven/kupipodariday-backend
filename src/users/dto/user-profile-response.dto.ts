import {
  IsNumber,
  IsInt,
  IsString,
  IsEmail,
  IsDate,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Exclude } from 'class-transformer';

export class UserProfileResponseDto {
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

  @IsEmail()
  email: string;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  @Exclude()
  password: string;

  constructor(partial: Partial<UserProfileResponseDto>) {
    Object.assign(this, partial);
  }
}
