/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

interface JwtPayload {
  role: string;
  identifier: string;
  name: string;
  sub: string;
  email: string;
  usertype: 'doctor' | 'patient';
  hospital: string;
  
}


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') { 
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'your_jwt_secret', // Load from .env in real apps
    });
  }

  validate(payload: JwtPayload) {
  console.log('JWT payload in validate():', payload); 
  return {
    userId: payload.sub,
    email: payload.email,
    role:  payload.role,
    usertype: payload.usertype,
    hospital: payload.hospital, 
    name: payload.name,
    identifier: payload.identifier,
    
  };
}

}
