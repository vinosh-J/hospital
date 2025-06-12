/* eslint-disable prettier/prettier */
// src/appointments/appointment.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  Req,
  Delete,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { BookAppointmentDto } from 'src/appointment/appointment/book-appointment.dto';
import { JwtAuthGuard } from 'auth/jwt-auth.guard';
import { Request } from 'express';
import { Role } from 'time slot/role.enum';
import { Roles } from 'auth/roles.decorator';
import { RolesGuard } from 'auth/roles.guard';

@Controller('appointment')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post('book-appointment')
  @Roles(Role.Patient)
  book(@Body() dto: BookAppointmentDto, @Req() req: Request) {
    const user = req.user as {
      userId: string;
      email: string;
      usertype: string;
    };
    return this.appointmentService.bookAppointment(dto, user.userId);
  }

  @Get('slots/:doctorId')
  @Roles(Role.Patient)
  getDoctorSlots(@Param('doctorId') doctorId: string) {
    return this.appointmentService.getAvailableSlotsByDoctor(doctorId);
  }

  @Get('my-appointments')
  @Roles(Role.Patient)
  getMyAppointments(@Req() req: Request) {
    const user = req.user as {
      userId: string;
    };
    return this.appointmentService.getMyAppointments(user.userId);
  }

  @Delete('cancel-appointment/:appointmentId')
  @Roles(Role.Patient)
  cancelAppointment( @Param('appointmentId') appointmentId: string, @Req() req: Request,) {
  const user = req.user as { userId: string };
  return this.appointmentService.cancelAppointment(appointmentId, user.userId);
}

@Get('appointments/today')
@Roles(Role.Patient)
getTodaysAppointments(@Req() req: Request) {
  const user = req.user as { userId: string };
  return this.appointmentService.getTodaysAppointments(user.userId);
}

@Get('appointments/upcoming')
@Roles(Role.Patient)
getUpcomingAppointments(@Req() req: Request) {
  const user = req.user as { userId: string };
  return this.appointmentService.getUpcomingAppointments(user.userId);
}

@Get('doctor/appointments/today')
@Roles(Role.Doctor)
getDoctorsTodaysAppointments(@Req() req: Request) {
  const user = req.user as { userId: string };
  return this.appointmentService.getDoctorsTodaysAppointments(user.userId);
}

@Get('doctor/appointments/upcoming')
@Roles(Role.Doctor)
getDoctorsUpcomingAppointments(@Req() req: Request) {
  const user = req.user as { userId: string };
  return this.appointmentService.getDoctorsUpcomingAppointments(user.userId);
}

}
