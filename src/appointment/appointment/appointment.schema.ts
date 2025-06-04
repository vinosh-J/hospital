/* eslint-disable prettier/prettier */
// src/appointments/appointment.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Appointment {
  @Prop({ type: Types.ObjectId, ref: 'Slot', required: true })
  slotId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'user', required: true })
  patientId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'user', required: true })
  doctorId: Types.ObjectId;
}

export type AppointmentDocument = Appointment & Document;
export const AppointmentSchema = SchemaFactory.createForClass(Appointment);
