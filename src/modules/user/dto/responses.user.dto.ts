import { IsString, IsBoolean, IsEmail } from 'class-validator';
import type { Date, ObjectId, Types } from 'mongoose';
import {Expose}  from 'class-transformer';

export class ResponseUser {
@IsString()
  _id: Types.ObjectId;

@IsString()
@Expose()
  firstName: string;

@IsString()
@Expose()
  lastName: string;

@IsString()
@Expose()
role:string

@IsBoolean()
@Expose()
  isActive: boolean;

@IsEmail()
@Expose()
  email: string;

@IsString()
@Expose()
  createdAt: Date;
  
@IsString()
@Expose()
  updatedAt: Date;
  @IsString()
  __v: number
}