/* eslint-disable prettier/prettier */
// dto/create-slot.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSlotDto {
  @IsString()
  @IsNotEmpty()
  fromTime: string; // e.g., "10:00"

  @IsString()
  @IsNotEmpty()
  toTime: string; // e.g., "22:00"
}
