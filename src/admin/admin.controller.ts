/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Delete, Param, Body, UseGuards, Req, Put } from '@nestjs/common';
import { AdminService } from 'admin/admin.service';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'auth/roles.guard';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { UpdateUserDto } from 'src/dto/update-user.dto';
import { Request } from 'express';

@Controller('admin')
@UseGuards(RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('create-user')
  createUser(@Body() dto: CreateUserDto, @Req() req: Request) {
  const hospitalId = req.headers['x-tenant-id'] as string;

  const userPayload = {
    ...dto,
    hospital: hospitalId,
  };
    return this.adminService.createUser(userPayload);
  }

  @Get('users/:usertype')
  getUsersByType(@Param('usertype') usertype: 'doctor' | 'patient') {
    return this.adminService.getUsers(usertype);
  }

  @Put('update-user/:id')
  updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.adminService.updateUser(id, dto);
  }

  @Delete('delete-user/:id')
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }
}
