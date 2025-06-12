/* eslint-disable prettier/prettier */
// src/doctor/doctor.module.ts
import { Module } from '@nestjs/common';
import { DoctorController } from './doctor.controller';
import { DoctorService } from './doctor.service';
import { AppointmentModule } from 'src/appointment/appointment/appointment.module';
import { MongooseModule } from '@nestjs/mongoose';
import { userschema } from 'src/user/user.schema';
import { SlotSchema } from 'src/time slot/slot.schema';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'user', schema: userschema },
      { name: 'slot', schema: SlotSchema },
    ]),
    AppointmentModule,
    AuthModule,
],
  controllers: [DoctorController],
  providers: [DoctorService],
})
export class DoctorModule {}
