import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/config.type';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { UserService } from '../user/user.service';
import { User } from '../user/schemas/user.schema';
import { checkPassword } from 'src/util/compare.password';
import { JwtService } from '@nestjs/jwt';
import { ResponseUser } from '../user/dto/responses.user.dto';
import { CodeAuthDto } from './dto/codeAuth.dto';
import dayjs from 'dayjs';
import { UpdateUserDto } from '../user/dto/update-user.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { v4 as uuidv4 } from 'uuid';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset.password.dto';
@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {}

  /**
   * @param username
   * @param password
   * if username or password is empty throw UnauthorizedException
   * if username and password valid call signIn method from user service
   */
  async signIn(user: User): Promise<{
    access_token: string;
  }> {
    try {
      const payload = { email: user.email, sub: user._id.toString() };
      return {
        access_token: this.jwtService.sign(payload),
      };
    } catch (error) {
      throw new UnauthorizedException(`Login failed: ${error.message}`);
    }
  }

  async validateUser(username: string, pass: string): Promise<User | null> {
    const user = await this.userService.findUserByEmail(username);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    if (!user) return null;
    const isCompar = await checkPassword(pass, user.password);
    if (!isCompar) return null;
    return user;
  }
  /**
   * Sign up user
   * @param signUpDto
   * if password and rePassword not match throw UnauthorizedException
   *  if password is not strong enough throw BadRequestException
   * create createUserDto object from signUpDto
   * call createUser method from user service
   * call sendMail method from mail service
   * if sendMail method throw error throw UnauthorizedException
   * if createUser method throw error throw UnauthorizedException
   * @returns
   */
  async signUp(signUpDto: SignUpDto): Promise<{ message: string }> {
    try {
      if (signUpDto.password !== signUpDto.rePassword) {
        throw new UnauthorizedException(
          `Password and Confirm Password not match`,
        );
      }
      //check password is strong enough
      const passwordRegex =
        /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{7,}$/;
      if (!passwordRegex.test(signUpDto.password)) {
        throw new BadRequestException(
          'Password is not strong enough, please try again.',
        );
      }
      const createUserDto: CreateUserDto = {
        email: signUpDto.email,
        password: signUpDto.password,
        firstName: signUpDto.firstName,
        lastName: signUpDto.lastName,
      };
      const result = await this.userService.create(createUserDto);
      //send mail
      this.mailerService
        .sendMail({
          to: result.email,
          subject: 'Kích hoạt tài khoản tại Tortoise Nest Online',
          template: 'register',
          context: {
            name: result.lastName ?? result.email,
            activationCode: result.code_id,
          },
        })
        .catch(() => {});
      return { message: `Create account successfully with id:  ${result._id}` };
    } catch (error) {
      throw new UnauthorizedException(`Register failed: ${error.message}`);
    }
  }
  /**
   * @param userInfo: email, _id
   * if user not found throw UnauthorizedException
   * create responseUser object from user
   * if user is null return undefined
   * @returns responseUser
   */
  async getCurrentUser(userInfo: {
    _id: string;
    email: string;
  }): Promise<ResponseUser | undefined> {
    try {
      const user = await this.userService.findUserByID(userInfo._id);
      const responseUser = new ResponseUser();
      if (user !== null) {
        return {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          role: user.role,
          lastName: user.lastName,
          isActive: user.isActive,
          createdAt: (user as any).createdAt,
          updatedAt: (user as any).updatedAt,
          __v: user.__v,
        } as ResponseUser;
      }
    } catch (error) {
      throw new UnauthorizedException(
        `Get current user failed: ${error.message}`,
      );
    }
  }

  /**
   *
   * @param verifyInfo
   * call method findUserByEmail from user service
   * if user not found throw BadRequestException
   * check expired of code
   * if code is correct and not expired update isActive of user to true
   * if code is incorrect throw BadRequestException
   * if code is expired throw BadRequestException
   * remove OTP code used
   * @returns message
   */
  async handleActivityAccount(
    verifyInfo: CodeAuthDto,
  ): Promise<{ message: string }> {
    const user = await this.userService.findUserByEmail(verifyInfo.email);
    console.log(user);
    if (!user) {
      throw new BadRequestException('Invalid user');
    }
    //check expired
    if (!user.codeExpired) {
      throw new BadRequestException('Code expiration date is not set');
    }
    const checkIsBefore = dayjs().isBefore(user.codeExpired);
    if (checkIsBefore) {
      if (user.codeId === verifyInfo.verificationCode) {
        const updateUserDto = new UpdateUserDto();
        updateUserDto.isActive = true;
        updateUserDto.codeId = '';
        await this.userService.update(user._id.toString(), updateUserDto);
      } else {
        throw new BadRequestException('Your code is incorrect');
      }
    } else {
      throw new BadRequestException('Your code has expired');
    }
    return { message: 'Verification Successfully' };
  }


  /**
   * 
   * @param email
   * call method findUserByEmail from user service
   * if user not found throw BadRequestException
   * update codeId and codeExpired of user
   * call method update from user service
   * if update failed throw BadRequestException
   * send mail
   * @returns message
   */
  async reVerify(email: string): Promise<{ message: string }> {
    const user = await this.userService.findUserByEmail(email);
    if (!user) {
      throw new BadRequestException('Invalid email');
    }
    user.codeId = uuidv4().replace(/\D/g, '').slice(0, 8),
    user.codeExpired = dayjs().add(5, 'minutes').toDate();
    const updateUser = await this.userService.update(user._id.toString(), user);
    if(!updateUser){
      throw new BadRequestException('Update code failed');
    }
    //send mail
    this.mailerService
      .sendMail({
        to: user.email,
        subject: 'Kích hoạt tài khoản tại Tortoise Nest Online',
        template: 'register',
        context: {
          name: user.lastName ?? user.email,
          activationCode: user.codeId,
        },
      })
      .catch(() => {});
    return { message: 'Resend verification code successfully' };
  }

  /**
   * @param forgotPasswordDto 
   * call method reVerify
   * if reVerify failed throw BadRequestException
   * @returns message
   */
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    const reVerify = await this.reVerify(forgotPasswordDto.email);
    if(!reVerify){
      throw new BadRequestException('Resend code failed');
    }
    return { message: 'A code OTP will be sent to email in a few minutes, Please check your email!' };
  }

  /**
   * 
   * @param resetPassword 
   * check if the new password is strong enough
   * call method findUserByEmail from user service
   * if user not found throw BadRequestException
   * check expired
   * if code is correct update password of user
   * if code is incorrect throw BadRequestException
   * if code is expired throw BadRequestException
   * remove OTP code used
   * @returns message
   */
  async resetPassword(resetPassword: ResetPasswordDto): Promise<{ message: string }> {
    // Check if the new password is strong enough
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{7,}$/;
    if (!passwordRegex.test(resetPassword.newPassword)) {
      throw new BadRequestException('Password is not strong enough, please try again.');
    }
    const user = await this.userService.findUserByEmail(resetPassword.email);
    if (!user) {
      throw new BadRequestException('Invalid user');
    }
    //check expired
    const checkIsBefore = dayjs().isBefore(user.codeExpired);
    if (checkIsBefore) {
      if (user.codeId === resetPassword.codeId) {
        const updateUserDto = new UpdateUserDto();
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(resetPassword.newPassword, salt);
        updateUserDto.password = hashedPassword;
        updateUserDto.codeId = '';
        updateUserDto.codeExpired = undefined;
        await this.userService.update(user._id.toString(), updateUserDto);
      } else {
        throw new BadRequestException('Your code is incorrect');
      }
    } else {
      throw new BadRequestException('Your code has expired');
    }
    return { message: 'Reset password successfully' };
  }


  async refreshToken(
    refreshToken: string,
    username: string,
  ): Promise<{ access_token: string }> {
    try {
      return { access_token: 'new access token' };
    } catch (error) {
      throw new UnauthorizedException(`Refresh token failed: ${error.message}`);
    }
  }
}
