import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entites/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { BaseResponseDto } from 'src/helper/base-response.dto';
import { message } from 'src/constant/message';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async createUser(body: CreateUserDto): Promise<BaseResponseDto> {
    try {
      const isExits = await this.userRepository.count({
        where: [
          {
            email: body.email.trim(),
          },
          {
            phone: body.phone.trim(),
          },
        ],
      });

      if (isExits != 0) {
        throw new HttpException(message.USER_EXITS, HttpStatus.BAD_REQUEST);
      }

      const user = new User();
      user.first_name = body.first_name;
      user.last_name = body.last_name;
      user.email = body.email.trim();
      user.phone = body.phone ? body.phone.trim() : null;
      user.password = await this.passwordHash(body.password);
      user.activation_key = await this.jwtService.sign(
        {},
        { secret: process.env.SECRET },
      );

      const data = await this.userRepository.save({
        ...user,
        role: { id: body.role },
      });
      return {
        statusCode: HttpStatus.CREATED,
        message: message.USER_CREATED,
        data,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async passwordHash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(parseInt(process.env.SALT_ROUND));
    return await bcrypt.hash(password.trim(), salt);
  }
}
