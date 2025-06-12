/* eslint-disable prettier/prettier */
import { Request } from 'express';
import { JwtPayload } from './jwt-payload.interface';

export interface JwtRequest extends Request {
  user: JwtPayload;
}
