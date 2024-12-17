import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsInt,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';

export class CreateTeacherDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  username: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsOptional()
  role?: string;
}
