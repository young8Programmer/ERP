import {
  IsString,
  IsOptional,
  IsInt,
  MinLength,
  MaxLength,
  IsEmail,
  IsPhoneNumber,
} from 'class-validator';


export class UpdateTeacherDto {
  @IsString()
  firstName?: string;

  @IsString()
  lastName?: string;

  @IsPhoneNumber()
  phone?: string;

  @IsString()
  address?: string;

  @IsString()
  specialty?: string;
}

