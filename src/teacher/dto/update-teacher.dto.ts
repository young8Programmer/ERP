import {
  IsString,
  IsOptional,
  IsInt,
  MinLength,
  MaxLength,
  IsEmail,
} from 'class-validator';

export class UpdateTeacherDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(100)
  fullname?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsInt()
  @IsOptional()
  age?: number;

  @IsString()
  @IsOptional()
  role?: string;
}
