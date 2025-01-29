import { IsOptional, IsString, IsEmail, IsPhoneNumber, Length } from 'class-validator';

export class UpdateAdminDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @Length(3, 50)
  firstName?: string;

  @IsString()
  @Length(3, 50)
  lastName?: string;

  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;
}
