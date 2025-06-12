/* eslint-disable prettier/prettier */
// src/types/request-with-user.ts
import { Request } from 'express';

export interface JwtUserPayload {
  userId: string;
  email: string;
  usertype: 'doctor' | 'patient';
  role: 'doctor' | 'patient' ;
  hospital: string;
} 

export interface RequestWithUser extends Request {
  user: JwtUserPayload;
}
