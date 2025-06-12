/* eslint-disable prettier/prettier */
import { Request } from 'express';
import { Types } from 'mongoose';

export interface RequestWithUser extends Request {
  user: {
    _id: Types.ObjectId;
    email: string;
    role: 'doctor' | 'patient' ; // add roles as needed
    hospitalId: Types.ObjectId;
  };
}
