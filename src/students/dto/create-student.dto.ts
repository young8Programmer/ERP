import { IsNotEmpty, IsString, IsPhoneNumber, Length } from 'class-validator';

export class CreateStudentDto {
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
  courseId: number;

  
  @IsString()
  @IsNotEmpty()
  groupIds: number[];
}
