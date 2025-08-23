import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsString, IsNotEmpty ,IsOptional} from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
     @IsOptional()
     @IsString()
     @IsNotEmpty()
     firstName?: string;

     @IsOptional()
     @IsString()
     @IsNotEmpty()
     lastName?: string;

     @IsOptional()
     isActive?: boolean;

}
