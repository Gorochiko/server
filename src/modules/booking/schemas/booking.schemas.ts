import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';


@Schema({ timestamps: true })
export class Booking {
    _id: Types.ObjectId;

    @Prop({ required: true })
    email: string;

    @Prop({ required: true })
    teacherId: string;

    @Prop({ required: true })
    teacherName: string;

    @Prop({ required: false }) 
    transactionId?: string;

    @Prop({ required: true })
    courseType: string;

    @Prop({ required: true })
    totalAmount: number;

    @Prop({ required: true, enum: ['pending', 'paid', 'cancelled'], default: 'pending' })
    status: string;

}

export type BookingDocument = HydratedDocument<Booking>;
export const BookingSchema = SchemaFactory.createForClass(Booking);