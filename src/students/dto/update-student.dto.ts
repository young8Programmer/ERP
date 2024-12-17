import { PartialType } from '@nestjs/mapped-types';
import { CreateStudentDto } from './create-student.dto';
import { IsOptional, IsString, IsEmail, MinLength, MaxLength, IsIn } from 'class-validator';

export class UpdateStudentDto extends PartialType(CreateStudentDto) {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  username?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(50)
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(40)
  password?: string;

  @IsOptional()
  @IsIn(['student', 'admin'])
  role?: string;
}
