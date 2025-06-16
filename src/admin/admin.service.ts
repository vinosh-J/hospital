/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { UpdateUserDto } from 'src/dto/update-user.dto';

@Injectable()
export class AdminService {
  constructor(private readonly userService: UserService) {}

  createUser(dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  getUsers(usertype: 'doctor' | 'patient') {
    return this.userService.findallbytype(usertype);
  }

  updateUser(id: string, dto: UpdateUserDto) {
    return this.userService.updateUser(id, dto);
  }

  deleteUser(id: string) {
    return this.userService.deleteUser(id);
  }
}
