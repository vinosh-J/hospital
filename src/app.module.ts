/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './auth/roles.guard'; 
import { HospitalModule } from './hospital/hospital.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { SlotModule } from './time slot/slot.module';
import { AppointmentModule } from './appointment/appointment/appointment.module';
import { PatientModule } from './patients/patient.module';
import { DoctorModule } from './filters/doctor.module';

@Module({
  imports: [
    
    AuthModule,
    PatientModule,
    MongooseModule.forRoot('mongodb://localhost/hospitalDB2'),
    UserModule,
    HospitalModule,
    SlotModule,
    AppointmentModule,
    DoctorModule,
   
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