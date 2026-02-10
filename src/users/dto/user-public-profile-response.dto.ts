import { Exclude } from 'class-transformer';

export class UserPublicProfileResponseDto {
  id: number;
  username: string;
  about: string;
  avatar: string;
  createdAt: Date;
  updatedAt: Date;

  @Exclude()
  email: string;

  @Exclude()
  password: string;

  constructor(partial: Partial<UserPublicProfileResponseDto>) {
    Object.assign(this, partial);
  }
}
