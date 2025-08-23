import { Inject, Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create.booking.dto';
import type { IBookingRepository } from './responsitories/booking.repo';
import * as crypto from 'crypto';
import { MailerService } from '@nestjs-modules/mailer';


export const BOOKING_TOKEN = "BOOKING-RESPONSITORY";
@Injectable()
export class BookingService {
    constructor(
        @Inject(BOOKING_TOKEN)
        private bookingRepository: IBookingRepository,
        private readonly mailerService: MailerService,
    ) { }




    async createBooking(bookingData: CreateBookingDto): Promise<any> {
        try {
            if (!bookingData.email || !bookingData.teacherId || !bookingData.teacherName || !bookingData.courseType || !bookingData.totalAmount) {
                throw new Error('Missing required booking fields');
            }
            const newBooking = await this.bookingRepository.createBooking({
                ...bookingData,
                status: 'pending',
            });


            const partnerCode = process.env.MOMO_PARTNER_CODE;
            const accessKey = process.env.MOMO_ACCESS_KEY;
            const secretKey = process.env.MOMO_SECRET_KEY;

            if (!partnerCode) {
                throw new Error('MOMO_PARTNER_CODE is not defined in environment variables');
            }
            if (!secretKey) {
                throw new Error('MOMO_SECRET_KEY is not defined in environment variables');
            }

            const requestId = partnerCode + new Date().getTime();
            const orderId = requestId;
            const orderInfo = 'Payment with Momo';
            const redirectUrl = `${process.env.MOMO_REDIRECT_URL}?bookingId=${newBooking._id}`;
            const ipnUrl = process.env.MOMO_IPN_URL;
            const amount = bookingData.totalAmount;
            const requestType = 'payWithMethod';
            const extraData = '';

            const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
            const signature = crypto
                .createHmac('sha256', secretKey)
                .update(rawSignature)
                .digest('hex');

            const requestBody = {
                partnerCode,
                accessKey,
                requestId,
                amount,
                orderId,
                orderInfo,
                redirectUrl,
                ipnUrl,
                extraData,
                requestType,
                signature,
                lang: 'en',
            };

            const momoApi = process.env.MOMO_API;
            if (!momoApi) {
                throw new Error('MOMO_API is not defined in environment variables');
            }
            const momoResponse = await fetch(momoApi, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });

            const data = await momoResponse.json();

            if (data.resultCode !== 0) {
                throw new Error(data.message || 'Momo payment creation failed');
            }

            return {
                bookingId: newBooking['_id'],
                momoResponse: data,
            };
        } catch (error: any) {
            throw new Error(`Failed to create booking: ${error.message}`);
        }
    }


    async confirmPayment(bookingId: string, transactionId: string): Promise<any> {
        const booking = await this.bookingRepository.findBookingById(bookingId);

        if (!booking) {
            throw new Error('Booking not found');
        }


        const updatedBooking = await this.bookingRepository.updateBookingStatus(
            bookingId,
            'paid',
            transactionId);
        if (!updatedBooking) {
            throw new Error('Failed to update booking status');
        }
        const formattedAmount = new Intl.NumberFormat('vi-VN').format(booking.totalAmount);

        await this.mailerService.sendMail({
            to: booking.email,
            subject: 'Thanh toán thành công - Xác nhận đặt chỗ',
            template: 'payment',
            context: {
                name: booking.teacherName,
                courseType: booking.courseType,
                amount: formattedAmount,
                bookingId: bookingId,
                currentDate: new Date().toLocaleDateString('vi-VN')
            },
        });

        return updatedBooking;
    }
}
