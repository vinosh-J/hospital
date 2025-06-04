/* eslint-disable prettier/prettier */
// src/slot/slot.controller.ts
import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { SlotService } from './slot.service';
import { CreateSlotDto } from 'src/time slot/create-slot.dto';
import { Slot } from './slot.schema';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/time slot/role.enum';
import { Get, Param } from '@nestjs/common';
import { Types } from 'mongoose';

@Controller('doctor')
export class SlotController {
  constructor(private readonly slotService: SlotService) {}

  @Roles(Role.Doctor)
  @Post('available-slot')
  async createAvailableSlots(@Body() dto: CreateSlotDto): Promise<Slot[]> {
    return this.slotService.createSlots(dto);
  }

  @Get('slots/:doctorId')
@Roles(Role.Doctor)
async getDoctorSlots(@Param('doctorId') doctorId: string): Promise<Slot[]> {
  if (!Types.ObjectId.isValid(doctorId)) {
    throw new BadRequestException('Invalid doctor ID');
  }
  return this.slotService.getDoctorSlots(doctorId);
}


}
