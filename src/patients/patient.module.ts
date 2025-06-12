/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Patient, PatientSchema } from './patient.schema';
import { PatientService } from './patient.service';
import { PatientController } from './patient.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Patient.name, schema: PatientSchema }]),
  ],
  controllers: [PatientController], 
  providers: [PatientService],
  exports: [PatientService],
})
export class PatientModule {}
