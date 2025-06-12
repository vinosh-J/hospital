/* eslint-disable prettier/prettier */
import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { HospitalService } from './hospital.service';
import { Hospital } from './hospital.schema';
import { Public } from 'src/auth/pubic.decorator';

@Controller('hospital')
export class HospitalController {
  constructor(private readonly hospitalService: HospitalService) {}

  @Public()
  @Post('create')
  createHospital(@Body() body: { name: string; location: string }): Promise<Hospital> { 
    return this.hospitalService.create(body.name, body.location);
  }

  @Public()
  @Get('all')
  getAll(): Promise<Hospital[]> {
    return this.hospitalService.findAll();
  }

  @Public()
  @Get(':id')
  getById(@Param('id') id: string): Promise<Hospital> {
    return this.hospitalService.findById(id);
  }
}
