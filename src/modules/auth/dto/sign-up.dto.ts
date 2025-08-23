import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class SignUpDto {
  @ApiProperty({
    example: 'John',
    description: 'Fist Name',
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Last Name',
  })
  @IsString()
  lastName: string;

  @ApiProperty({
    example: 'johndoe',
    description: 'Username',
  })

  @IsString()
  @MinLength(1)
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description: "User's password",
  })
  @IsString()
  password: string;

  @ApiProperty({
    example: 'Password123!',
    description: "User's password",
  })
  @IsString()
  rePassword: string;
}
