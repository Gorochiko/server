import { Body, Controller, Param, Post } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create.booking.dto';
import { Booking } from './schemas/booking.schemas';

@Controller('booking')
export class BookingController {
    constructor(private readonly bookingService: BookingService) {
    }
    @Post()
    async createBooking(@Body() bookingData: CreateBookingDto): Promise<Booking> {
        return this.bookingService.createBooking(bookingData);
    }

    @Post(':id/confirm')
    async confirmPayment(@Param('id') bookingId: string,  @Body('transactionId') transactionId: string,): Promise<Booking | null> {
        return this.bookingService.confirmPayment(bookingId,transactionId);
    }
}
