import { IsNotEmpty } from "class-validator";

export class CodeAuthDto{
    @IsNotEmpty()
    email:string;
    @IsNotEmpty()
    verificationCode:string;
}