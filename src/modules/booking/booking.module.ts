import { Module } from '@nestjs/common';
import { BookingService,BOOKING_TOKEN } from './booking.service';
import { BookingController } from './booking.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Booking, BookingSchema } from './schemas/booking.schemas';
import { BookingRepository } from './responsitories/booking.repo';

@Module({
  imports: [MongooseModule.forFeature([{ name: Booking.name, schema: BookingSchema }])],
  providers: [
    BookingService,
    {
      provide: BOOKING_TOKEN,
      useClass: BookingRepository,
      
    },
  ],
  controllers: [BookingController],
  exports: [
    BookingService,
  ],
})
export class BookingModule {}
