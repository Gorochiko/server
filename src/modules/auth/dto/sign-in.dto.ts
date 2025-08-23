import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";

export class SignInDto {
  @ApiProperty({
    example: "johndoe",
    description: "Username"
  })
  @IsString()
  @MinLength(1)
  email: string;

  @ApiProperty({
    example: "Password123!",
    description: "User's password"
  })
  @IsString()
  password: string;
} 