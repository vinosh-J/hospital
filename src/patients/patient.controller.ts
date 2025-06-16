/* eslint-disable prettier/prettier */
import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PatientService } from './patient.service';
import { Public } from 'src/auth/pubic.decorator';

interface SafeMulterFile extends Express.Multer.File {
  buffer: Buffer;
}

@Controller('patients')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Public()
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadExcel(@UploadedFile() file: SafeMulterFile): Promise<any> {
    if (!file || !(file.buffer instanceof Buffer)) {
      throw new BadRequestException('Invalid file upload');
    }

    return this.patientService.uploadPatientsFromExcel(file.buffer);
  }

}
