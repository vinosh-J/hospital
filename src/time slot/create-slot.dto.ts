/* eslint-disable prettier/prettier */
import { IsDateString, IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateSlotDto {
  @IsMongoId()
  @IsNotEmpty()
  doctorId: string;

  @IsDateString()
  @IsNotEmpty()
  from: string;

  @IsDateString()
  @IsNotEmpty()
  to: string;
}