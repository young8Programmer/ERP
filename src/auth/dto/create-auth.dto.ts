import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAuthDto {
  @IsNotEmpty()
  @IsString()
  full_name: string; 

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  role: 'admin' | 'student' | 'teacher';
}
