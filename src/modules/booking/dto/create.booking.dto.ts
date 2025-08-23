import { IsString, IsNumber, IsOptional } from 'class-validator';


export class CreateBookingDto {
    @IsString()
    email: string;

    @IsString()
    teacherId: string;

    @IsString()
    teacherName: string;

    @IsString()
    @IsOptional()
    courseType?: string;

    @IsString()
    @IsOptional()
    notes?: string;

     @IsOptional()
    status?: string; 
    
    @IsNumber()
    totalAmount: number;
}