/* eslint-disable prettier/prettier */
// src/appointments/appointment.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Appointment, AppointmentDocument } from './appointment.schema';
import { Model, Types } from 'mongoose';
import { BookAppointmentDto } from 'appointment/appointment/book-appointment.dto'
import { Slot, SlotDocument } from 'time slot/slot.schema';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { userdocument } from 'src/user/user.schema';

dayjs.extend(utc);

@Injectable()
export class AppointmentService {
  constructor(
    @InjectModel(Appointment.name) private readonly appointmentModel: Model<AppointmentDocument>,
    @InjectModel(Slot.name) private readonly slotModel: Model<SlotDocument>,
    @InjectModel('user') private readonly userModel: Model<userdocument>,
  ) {}

  async bookAppointment(dto: BookAppointmentDto, patientId: string): Promise<Appointment> {
  const slot = await this.slotModel.findById(dto.slotId);
  if (!slot || slot.status !== 'available') {
    throw new NotFoundException('Slot not available');
  }

  const [doctor, patient] = await Promise.all([
    this.userModel.findById(slot.doctorId).lean(),
    this.userModel.findById(patientId).lean(),
  ]);

  if (!doctor || !patient) {
    throw new NotFoundException('Doctor or patient not found');
  }

  slot.status = 'booked';
  await slot.save();

  const appointment = new this.appointmentModel({
    slotId: slot._id,
    doctorId: doctor._id,
    patientId: patient._id,
    doctorDetails: {
      name: doctor.name,
      email: doctor.email,
      age: doctor.age,
      address: doctor.address,
      _id: doctor._id,
    },
    patientDetails: {
      name: patient.name,
      email: patient.email,
      age: patient.age,
      address: patient.address,
      _id: patient._id,
    },
  });

  return appointment.save();
}


  async getAvailableSlotsByDoctor(doctorId: string): Promise<Slot[]> {
    return this.slotModel
      .find({ doctorId: new Types.ObjectId(doctorId), status: 'available' })
      .populate({ path: 'doctorId', model: 'user' })
      .exec();
  }

  async getMyAppointments(patientId: string): Promise<Appointment[]> {
    return this.appointmentModel
      .find({ patientId: new Types.ObjectId(patientId) })
      .populate('slotId')
      .populate({ path: 'doctorId', model: 'user' })
      .exec();
  }

  async cancelAppointment(appointmentId: string, patientId: string): Promise<{ message: string }> {
  const appointment = await this.appointmentModel.findById(appointmentId);
  
  if (!appointment) {
    throw new NotFoundException('Appointment not found');
  }

  if (appointment.patientId.toString() !== patientId) {
    throw new Error('Unauthorized to cancel this appointment');
  }

  // Set slot status back to available
  await this.slotModel.findByIdAndUpdate(appointment.slotId, {
    status: 'available',
  });

  // Delete the appointment
  await this.appointmentModel.findByIdAndDelete(appointmentId);
  return { message: 'Appointment cancelled and slot marked as available' };
}
//todays and upcoming appointments
async getTodaysAppointments(patientId: string): Promise<Appointment[]> {
  const startOfDay = dayjs().utc().startOf('day').toDate();
  const endOfDay = dayjs().utc().endOf('day').toDate();

  const slotsToday = await this.slotModel.find({
    from: { $gte: startOfDay, $lte: endOfDay },
  });

  const slotIds = slotsToday.map(slot => slot._id);

  return this.appointmentModel
    .find({
      patientId: new Types.ObjectId(patientId),
      slotId: { $in: slotIds },
    })
    .populate('slotId')
    .populate('doctorId')
    .exec();
}

async getUpcomingAppointments(patientId: string): Promise<Appointment[]> {
  const tomorrow = dayjs().utc().endOf('day').toDate();

  const slotsUpcoming = await this.slotModel.find({
    from: { $gt: tomorrow },
  });

  const slotIds = slotsUpcoming.map(slot => slot._id);

  return this.appointmentModel
    .find({
      patientId: new Types.ObjectId(patientId),
      slotId: { $in: slotIds },
    })
    .populate('slotId')
    .populate('doctorId')
    .exec();
}

async getDoctorsTodaysAppointments(doctorId: string): Promise<Appointment[]> {
  const startOfDay = dayjs().utc().startOf('day').toDate();
  const endOfDay = dayjs().utc().endOf('day').toDate();


  const slotsToday = await this.slotModel.find({
    doctorId: new Types.ObjectId(doctorId),
    from: { $gte: startOfDay, $lte: endOfDay },
  });

  const slotIds = slotsToday.map(slot => slot._id);

  return this.appointmentModel
    .find({
      doctorId: new Types.ObjectId(doctorId),
      slotId: { $in: slotIds },
    })
    .populate('slotId')
    .populate('patientId')
    .exec();
}

async getDoctorsUpcomingAppointments(doctorId: string): Promise<Appointment[]> {
  const tomorrow = dayjs().utc().endOf('day').toDate();

  const slotsUpcoming = await this.slotModel.find({
    doctorId: new Types.ObjectId(doctorId),
    from: { $gt: tomorrow },
  });

  const slotIds = slotsUpcoming.map(slot => slot._id);

  return this.appointmentModel
    .find({
      doctorId: new Types.ObjectId(doctorId),
      slotId: { $in: slotIds },
    })
    .populate('slotId')
    .populate('patientId')
    .exec();
}

}
export { Appointment };

