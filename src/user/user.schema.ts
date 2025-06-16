/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type userdocument = user & Document & { _id: Types.ObjectId };


@Schema()
export class user extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  address: string;

  @Prop()
  age: number;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ required: true, enum: ['doctor', 'patient', 'admin'] })
  usertype: 'doctor' | 'patient' | 'admin';

  @Prop({ type: Types.ObjectId, ref: 'Hospital', required: true })
  hospital: Types.ObjectId;

  @Prop()
  otp?: string;

  @Prop()
  otpExpiresAt?: Date;

 @Prop({ type: String })
 identifier?: string;

}

export const userschema = SchemaFactory.createForClass(user);

userschema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    return ret;
  },
});