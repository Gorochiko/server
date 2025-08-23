import { IsString, IsEmail, IsNotEmpty, Min,Max, MinLength, MaxLength, IsOptional } from 'class-validator';
import { UserDocument } from '../schemas/user.schema';
export class CreateUserDto {
    
    @MinLength(1)
    @IsString()
    @IsNotEmpty()
    firstName: string;
    
    @MinLength(1)
    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsOptional()
    @IsString()
    address?: string;

    @MinLength(1)
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @MinLength(8)
    @MaxLength(30)
    @IsNotEmpty()
    password: string;

    @IsOptional()
    role?:string

    @IsOptional()
    codeId?: string;

    @IsOptional()
    codeExpired?: Date;
}
