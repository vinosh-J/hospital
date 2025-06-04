/* eslint-disable prettier/prettier */
// src/slot/slot.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SlotDocument = Slot & Document;

@Schema()
export class Slot {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  doctorId: Types.ObjectId;

  @Prop({ required: true })
  from: Date;

  @Prop({ required: true })
  to: Date;

  @Prop({ required: true, default: 'available' })
  status: 'available' | 'booked';
}

export const SlotSchema = SchemaFactory.createForClass(Slot);
