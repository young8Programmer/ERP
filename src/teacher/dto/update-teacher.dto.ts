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
  username?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  role?: string;
}
