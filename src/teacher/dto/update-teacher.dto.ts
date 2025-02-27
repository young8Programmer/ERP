import {
  IsString,
  IsOptional,
  IsPhoneNumber,
  Length
} from 'class-validator';

export class UpdateTeacherDto {
  @IsString()
  @IsOptional()
  @Length(3, 50)
  firstName?: string;

  @IsString()
  @IsOptional()
  @Length(3, 50)
  lastName?: string;

  @IsPhoneNumber()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  specialty?: string;

  @IsString()
  @IsOptional()
  username?: string;  // Allow updating username

  @IsString()
  @IsOptional()
  password?: string;  // Allow updating password
}
