/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsEmail } from 'class-validator';
import { Document, Types } from 'mongoose';

export type PatientDocument = Patient & Document;

@Schema({ timestamps: true })
export class Patient {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  @IsEmail()
  email: string;
  
  @Prop({ required: true })
  identifier: string;

  @Prop({ default: 'inactive' })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'Hospital', required: false })
  hospital?: Types.ObjectId;

}
export const PatientSchema = SchemaFactory.createForClass(Patient);

