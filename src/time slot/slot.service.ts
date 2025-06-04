/* eslint-disable prettier/prettier */
// src/slot/slot.service.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Slot, SlotDocument } from './slot.schema';
import { Model, Types } from 'mongoose';
import { CreateSlotDto } from 'src/time slot/create-slot.dto';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc as dayjs.PluginFunc);
dayjs.extend(timezone as dayjs.PluginFunc);

@Injectable()
export class SlotService {
  constructor(
    @InjectModel(Slot.name)
    private readonly slotModel: Model<SlotDocument>,
  ) {}

  async createSlots(dto: CreateSlotDto): Promise<Slot[]> {
    const { doctorId, from, to } = dto;

   
  const fromTime = dayjs(from).tz('Asia/Kolkata');
  const toTime = dayjs(to).tz('Asia/Kolkata');

    const slots: Slot[] = [];

    let current: Dayjs = fromTime;

    while (current.isBefore(toTime)) {
      const next: Dayjs = current.add(15, 'minute');

      const slot: SlotDocument = new this.slotModel({
        doctorId: new Types.ObjectId(doctorId),
        from: current.toDate(),
        to: next.toDate(),
        status: 'available',
      });

      slots.push(slot);
      current = next;
    }

    return this.slotModel.insertMany(slots);
  }

  async getDoctorSlots(doctorId: string): Promise<Slot[]> {
    return this.slotModel.find({ doctorId, status: 'available' }).exec();
  }
}
