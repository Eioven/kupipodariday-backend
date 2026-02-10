import {
  IsString,
  IsUrl,
  IsArray,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class UpdateWishlistDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsUrl()
  @IsOptional()
  image?: string;

  @IsArray()
  @IsOptional()
  @IsNumber({}, { each: true })
  itemsId?: number[];
}
