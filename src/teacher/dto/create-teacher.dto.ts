import { IsNotEmpty, IsString, IsPhoneNumber, Length } from 'class-validator';

export class CreateTeacherDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 50)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 50)
  lastName: string;

  @IsPhoneNumber()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  specialty: string;

  @IsString()
  @IsNotEmpty()
  username: string;  // Added username field

  @IsString()
  @IsNotEmpty()
  password: string;  // Added password field
}
