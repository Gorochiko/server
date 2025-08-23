import { InjectModel } from "@nestjs/mongoose";
import { Booking } from "../schemas/booking.schemas";
import { Model } from "mongoose";
import { Injectable } from "@nestjs/common";
import { CreateBookingDto } from "../dto/create.booking.dto";


export interface IBookingRepository {
    createBooking(bookingData: CreateBookingDto): Promise<Booking>;
    findBookingById(id: string): Promise<Booking | null>;
    updateBookingStatus(id: string, status: string, transactionId?: string): Promise<Booking | null>;
}
@Injectable()
export class BookingRepository implements IBookingRepository {
    constructor(@InjectModel(Booking.name) private bookingModel: Model<Booking>) { }
    async createBooking(bookingData: CreateBookingDto): Promise<Booking> {
        const newBooking = new this.bookingModel(bookingData);
        return newBooking.save();
    }

    async findBookingById(id: string): Promise<Booking | null> {
        return this.bookingModel.findById(id).exec();
    }


    async updateBookingStatus(bookingId: string, status: string, transactionId?: string,): Promise<Booking | null> {
        const booking = await this.bookingModel.findByIdAndUpdate(
            bookingId,
            {
                status,
                ...(transactionId && { transactionId }), 
            },
            { new: true },
        );
        return booking;
    }
}