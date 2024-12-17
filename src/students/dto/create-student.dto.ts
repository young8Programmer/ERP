import {
  IsString,
  IsEmail,
  IsOptional,
  IsIn,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateStudentDto {
  @IsString()
  @MaxLength(50)
  username: string;

  @IsEmail()
  @MaxLength(50)
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(40)
  password: string;

  @IsOptional()
  @IsIn(['admin', 'student', 'teacher'])
  role?: string;
}
