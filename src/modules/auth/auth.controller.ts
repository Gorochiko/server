import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ConfirmForgotPasswordDto } from './dto/confirm-forgot-password.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { LocalAuthGuard } from './passport/local-auth.guard';
import { JwtAuthGuard } from './passport/jwt-auth.guard';
import { CodeAuthDto } from './dto/codeAuth.dto';
import { ResetPasswordDto } from './dto/reset.password.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully authenticated',
    schema: {
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
      },
    },
  })
  async signIn(@Request() req) {
    const result = await this.authService.signIn(req.user);
    return result;
  }
  
  @Post('signUp')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Sign up user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User successfully created',
    schema: {
      properties: {
        message: { type: 'string' },
      },
    },
  })
  async signUp(@Body(ValidationPipe) signUpDto: SignUpDto) {
    const result = await this.authService.signUp(signUpDto);
    return result;
  }

  
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Current user profile',
  })
  getCurrentUser(@CurrentUser() user: any) {
    const result = this.authService.getCurrentUser(user);
    return result;
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Forgot password' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Forgot password',
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    const result = await this.authService.forgotPassword(forgotPasswordDto);
    return result;
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Forgot password' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Forgot password',
  })
  async resetPassword(@Body() resetPassword: ResetPasswordDto) {
    const result = await this.authService.resetPassword(resetPassword);
    return result;
  }

  /**
   * Refreshes the access token using a valid refresh token
   * @param refreshTokenDto - DTO containing the refresh token
   * @returns New authentication tokens
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(
      refreshTokenDto.refreshToken,
      refreshTokenDto.username,
    );
  }

  @Post('verify')
  verify(@Body() codeAuthDto:CodeAuthDto) {
    return this.authService.handleActivityAccount(codeAuthDto);
  }

  @Post('re-verify')
  reVerify(@Body("email") email:string) {
    return this.authService.reVerify(email);
  }


}
