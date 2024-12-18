import { PartialType } from '@nestjs/mapped-types';
import { CreateStudentDto } from './create-student.dto';
import { IsOptional, IsString, IsEmail, MinLength, MaxLength, IsIn, isPhoneNumber, max, min, isString } from 'class-validator';
import { isNamedType } from 'graphql';


export class UpdateStudentDto {
  @IsString()
  firstName?: string;

  @IsString()
  lastName?: string;

  phone?: string;

  @IsString()
  address?: string;
}