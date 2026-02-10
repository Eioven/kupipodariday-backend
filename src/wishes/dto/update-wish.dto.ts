import {
  IsString,
  IsUrl,
  IsNumber,
  MinLength,
  MaxLength,
  Min,
  IsOptional,
} from 'class-validator';

export class UpdateWishDto {
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(250)
  name?: string;

  @IsUrl()
  @IsOptional()
  link?: string;

  @IsUrl()
  @IsOptional()
  image?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  price?: number;

  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(1024)
  description?: string;

  // Note: 'raised' field is intentionally excluded from UpdateWishDto
  // It should only be updated internally when offers are created
}
