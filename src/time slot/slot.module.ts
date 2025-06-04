/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Slot, SlotSchema } from './slot.schema';
import { SlotService } from './slot.service';
import { SlotController } from './slot.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Slot.name, schema: SlotSchema }]),
  ],
  providers: [SlotService],
  controllers: [SlotController],
})
export class SlotModule {}