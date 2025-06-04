/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './auth/roles.guard'; // Adjust path if needed
import { HospitalModule } from './hospital/hospital.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { SlotModule } from './time slot/slot.module';
import { Appointment } from './appointment/appointment/appointment.schema';
import { AppointmentModule } from './appointment/appointment/appointment.module';

@Module({
  imports: [
    
    AuthModule,
    MongooseModule.forRoot('mongodb://localhost/hospitalDB2'),
    UserModule,
    HospitalModule,
    SlotModule,
    Appointment,
    AppointmentModule,
   
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})

export class AppModule {}