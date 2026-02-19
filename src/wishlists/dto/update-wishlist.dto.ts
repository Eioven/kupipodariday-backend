import {
  IsString,
  IsUrl,
  IsArray,
  IsNumber,
  IsOptional,
  MaxLength,
  IsInt,
  Min,
} from 'class-validator';

export class UpdateWishlistDto {
  @IsString()
  @IsOptional()
  @MaxLength(250)
  name?: string;

  @IsUrl()
  @IsOptional()
  image?: string;

  @IsArray()
  @IsOptional()
  @IsNumber({}, { each: true })
  @IsInt({ each: true })
  @Min(1, { each: true })
  itemsId?: number[];
}
