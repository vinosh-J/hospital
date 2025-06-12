/* eslint-disable prettier/prettier */
import * as XLSX from 'xlsx';
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Patient, PatientDocument } from './patient.schema';


interface ExcelPatientRow {
  Name: string;
  Email: string;
  Identifier: string;
}

@Injectable()
export class PatientService {
    userModel: any;
  constructor(
    @InjectModel(Patient.name) private patientModel: Model<PatientDocument>,
  ) {}

  async uploadPatientsFromExcel(buffer: Buffer): Promise<PatientDocument[]> {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData: ExcelPatientRow[] = XLSX.utils.sheet_to_json<ExcelPatientRow>(sheet);

      const patients: Omit<Patient, '_id'>[] = jsonData.map((row) => ({
        name: row.Name,
        email: row.Email,
        identifier: row.Identifier,
        status: 'inactive',
      }));

      return await this.patientModel.insertMany(patients);
    } catch (error) {
        console.error('Excel upload failed:', error);
      throw new BadRequestException('Invalid Excel file');
    }
  }

async findByIdentifier(identifier: string): Promise<PatientDocument | null> {
  console.log('Looking up patient with identifier:', identifier);
  if (!identifier) {
    throw new BadRequestException('Identifier is required');
  }
  return this.patientModel.findOne({ identifier }).exec();
}

async findByEmail(email: string): Promise<PatientDocument | null> {
  return this.patientModel.findOne({ email: email.toLowerCase() }).exec();
}


   
}
