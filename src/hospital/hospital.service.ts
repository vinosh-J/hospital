/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Hospital, HospitalDocument } from './hospital.schema';

@Injectable()
export class HospitalService {
  constructor(
    @InjectModel(Hospital.name) private readonly hospitalModel: Model<HospitalDocument>,
  ) {}

  async create(name: string, location: string): Promise<Hospital> {
    const hospital = new this.hospitalModel({ name, location });
    return hospital.save();
  }

  async findAll(): Promise<Hospital[]> {
    return this.hospitalModel.find().exec();
  }

  async findById(id: string): Promise<Hospital> {
    const hospital = await this.hospitalModel.findById(id);
    if (!hospital) {
      throw new NotFoundException(`Hospital with ID ${id} not found`);
    }
    return hospital;
  }
}