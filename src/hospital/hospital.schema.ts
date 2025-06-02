/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HospitalDocument = Hospital & Document;

@Schema()
export class Hospital {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  location: string;

  @Prop()
  description?: string;
}

export const HospitalSchema = SchemaFactory.createForClass(Hospital);