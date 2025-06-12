/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Query,
  Request,
  UseGuards,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { RequestWithUser } from 'src/types/request-with-user';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';


@UseGuards( JwtAuthGuard,RolesGuard)
@Roles('doctor')
@Controller('doctor')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Get('appointments-by-date')
  async getAppointmentsByDate(
    @Query('date') date: string,
    @Request() req: RequestWithUser,
  ) {
    if (req.user.usertype !== 'doctor') throw new UnauthorizedException();
    return this.doctorService.getAppointmentsByDate(req.user.userId, date);
  }

  
 @Get('search-patient')
  async searchPatients(
    @Request() req: RequestWithUser,
    @Query('name') name?: string,
    @Query('email') email?: string, 
  ) {
    if (req.user.usertype !== 'doctor') throw new UnauthorizedException();
    if (!name && !email) {
      throw new BadRequestException('Please provide name or email to search');
    }
    return this.doctorService.searchPatients(req.user.userId, name, email);
  }
}

