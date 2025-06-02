/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Req, Headers} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Request } from 'express';
import { user } from './user.schema';
import { Public } from 'src/auth/pubic.decorator';

type CreateUserWithExtrasDto = CreateUserDto & {
  usertype: 'doctor' | 'patient';
  password: string;
  hospital: string;
};

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
 @Post('doctor/create')
async createDoctor(
  @Headers('x-hospital-id') hospitalId: string, 
  @Body() dto: CreateUserDto,
): Promise<user> {
  const userData = {
    ...dto,
    usertype: 'doctor' as const,
    hospital: hospitalId,
  };
  return this.userService.create(userData);
}


@Public()
@Post('patient/create')
async createPatient(@Headers('x-hospital-id') hospitalId: string,
@Body() dto: CreateUserWithExtrasDto): Promise<user> {

  const userData = {
    ...dto,
    usertype: 'patient' as const,
    hospital: hospitalId,
  };

  return this.userService.create(userData);
}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('doctor')
  @Get('doctor/all')
  getAllDoctors(@Req() req: Request): Promise<user[]> {
    const { hospital } = req.user as user;
    return this.userService.findallbytype('doctor', hospital);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('doctor')
@Get('patient/all')
getAllPatients(@Req() req: Request): Promise<Partial<user>[]> {
  const { hospital } = req.user as user;
  return this.userService.findallbytype('patient', hospital);
}


  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Put(':id')
  updateUser(
    @Param('id') id: string,
    @Body() data: Partial<user>,
  ): Promise<user> {
    return this.userService.updateUser(id, data);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Delete(':id')
  deleteUser(@Param('id') id: string): Promise<{ message: string }> {
    return this.userService.deleteUser(id);
  }
}