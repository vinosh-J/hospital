/* eslint-disable prettier/prettier */
// doctor.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Appointment, AppointmentDocument } from 'src/appointment/appointment/appointment.schema';
import { Model, Types } from 'mongoose';
import { user, userdocument } from 'src/user/user.schema';
import { Slot, SlotDocument } from 'src/time slot/slot.schema';

@Injectable()
export class DoctorService {
  constructor(
    @InjectModel(Appointment.name) private appointmentModel: Model<AppointmentDocument>,
    @InjectModel(user.name) private userModel: Model<userdocument>,
    @InjectModel(Slot.name) private slotModel: Model<SlotDocument>,
  ) {}

  async getAppointmentsByDate(doctorId: string, date: string): Promise<Appointment[]> {
    const start = new Date(date);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setUTCHours(23, 59, 59, 999);

    const slots = await this.slotModel.find({
      doctorId: new Types.ObjectId(doctorId),
      from: { $gte: start, $lte: end },
    });

    const slotIds = slots.map((slot) => slot._id);

    return this.appointmentModel
      .find({ doctorId: new Types.ObjectId(doctorId), slotId: { $in: slotIds } })
      .populate('slotId')
      .populate('patientId')
      .exec();
  }

  async searchPatients(
  doctorId: string,
  name?: string,
  email?: string,
): Promise<userdocument[]> {
  const query: Record<string, unknown> = {
    usertype: 'patient',
  };

  if (name) {
    query.name = new RegExp(name, 'i');
  }

  if (email) {
    query.email = { $regex: new RegExp(`^${email}$`, 'i') };
  }

  const patients = await this.userModel.find(query).exec();

  if (!patients.length) throw new NotFoundException('No patients found');

  return patients;
}

}