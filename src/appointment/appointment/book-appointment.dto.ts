/* eslint-disable prettier/prettier */
// src/appointments/dto/create-appointment.dto.ts
import { IsMongoId } from 'class-validator';

export class BookAppointmentDto {
  @IsMongoId()
  slotId: string;
}
