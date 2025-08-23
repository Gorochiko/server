import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class ForgotPasswordDto {
  @ApiProperty({
    example: "johndoe",
    description: "Username"
  })
  @IsString()
  email: string;
} 