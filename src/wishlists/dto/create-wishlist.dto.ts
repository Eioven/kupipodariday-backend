import { IsString, IsUrl, IsArray, IsNumber, MaxLength, IsInt, Min } from 'class-validator';

export class CreateWishlistDto {
  @IsString()
  @MaxLength(250)
  name: string;

  @IsUrl()
  image: string;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsInt({ each: true })
  @Min(1, { each: true })
  itemsId: number[];
}
