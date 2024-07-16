import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { FindUsersDto } from './dto/find-users.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const { username, password, name } = dto;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = this.userRepository.create({
      username,
      password: hashedPassword,
      name,
    });

    const newUser = await this.userRepository.save(user);
    delete newUser.password;

    return newUser;
  }

  async findMany(dto: FindUsersDto) {
    return this.userRepository.createQueryBuilder('users').getMany();
  }

  async findOne(
    username: string,
    selectSecrets: boolean = false,
  ): Promise<User | undefined> {
    return this.userRepository.findOne({
      where: { username },
      select: {
        id: true,
        username: true,
        name: true,
        accountStatus: true,
        password: selectSecrets,
      },
    });
  }
}
