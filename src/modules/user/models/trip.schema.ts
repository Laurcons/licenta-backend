import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';

@Schema({
  timestamps: true,
})
export class Trip {
  _id: ObjectId;
  createdAt: Date;
  updatedAt: Date;

  @Prop({ required: true })
  destinationId: string;

  @Prop({ required: true })
  trainNum: string;

  @Prop({ required: true })
  date: Date;
}

export type TripDocument = Trip & Document;
export const TripSchema = SchemaFactory.createForClass(Trip);
