import { IsString, IsNotEmpty, IsOptional, IsPhoneNumber, IsInt, IsPositive } from 'class-validator';

export class CreateProfileDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsOptional()
  @IsString()
  photo?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsPhoneNumber()
  @IsNotEmpty()
  phone: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  studentId?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  adminId?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  teacherId?: number;
}
