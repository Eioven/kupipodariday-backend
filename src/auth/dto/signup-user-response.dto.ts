import {
  IsNumber,
  IsInt,
  IsString,
  IsEmail,
  IsDate,
  MinLength,
  MaxLength,
} from 'class-validator';

export class SignupUserResponseDto {
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
}
