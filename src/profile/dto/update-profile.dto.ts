import { IsString, IsNotEmpty, IsOptional, IsPhoneNumber, IsInt, IsPositive } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  firstName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  lastName?: string;

  @IsOptional()
  @IsString()
  photo?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  address?: string;

  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

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
