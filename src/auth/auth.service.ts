import { Injectable, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { QueryFailedError } from 'typeorm';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

const PG_UNIQUE_VIOLATION = '23505';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signup(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    try {
      const user = await this.usersService.create({
        ...createUserDto,
        password: hashedPassword,
      });

      return this.usersService.toPublicUser(user);
    } catch (err) {
      const code =
        err instanceof QueryFailedError
          ? ((
              err as QueryFailedError & {
                code?: string;
                driverError?: { code?: string };
              }
            ).code ??
            (err as QueryFailedError & { driverError?: { code?: string } })
              .driverError?.code)
          : undefined;
      if (code === PG_UNIQUE_VIOLATION) {
        throw new ConflictException(
          'User with this email or username already exists',
        );
      }
      throw err;
    }
  }

  login(user: User) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateUser(
    username: string,
    pass: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersService.findByUsername(username);
    if (user && (await bcrypt.compare(pass, user.password))) {
      return this.usersService.toPublicUser(user);
    }
    return null;
  }
}
