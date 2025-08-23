import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
// Update the import path below to the correct location of user.schema.ts
import { User } from 'src/modules/user/schemas/user.schema';
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<User> {
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new BadRequestException("Invalid username or password");
    }
    if(user.isActive===false){ 
      throw new BadRequestException("Account is not activity")
    }
    return user;
  }
}