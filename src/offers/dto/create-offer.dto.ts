import { IsNumber, IsBoolean, IsOptional, Min, IsInt } from 'class-validator';

export class CreateOfferDto {
  @IsNumber()
  @Min(1)
  amount: number;

  @IsBoolean()
  @IsOptional()
  hidden?: boolean;

  @IsNumber()
  @IsInt()
  @Min(1)
  itemId: number;
}
