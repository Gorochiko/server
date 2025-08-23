import { ApiProperty } from "@nestjs/swagger";
import { IsString, Length, MinLength } from "class-validator";

export class ConfirmForgotPasswordDto {
  @ApiProperty({
    example: "johndoe",
    description: "Username"
  })
  @IsString()
  username: string;

  @ApiProperty({
    example: "123456",
    description: "6-digit confirmation code"
  })
  @IsString()
  @Length(6, 6)
  code: string;

  @ApiProperty({
    example: "NewPassword123!",
    description: "New password (min 8 characters)"
  })
  @IsString()
  @MinLength(8)
  newPassword: string;
} 