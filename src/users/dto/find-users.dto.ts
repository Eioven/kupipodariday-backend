import { IsString, IsNotEmpty } from 'class-validator';

export class FindUsersDto {
  @IsString()
  @IsNotEmpty({ message: 'query не должно быть пустым' })
  query: string;
}
