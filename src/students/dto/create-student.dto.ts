import { IsArray, IsInt, IsString, ArrayNotEmpty } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  phone: string;

  @IsString()
  address: string;

  @IsInt()
  courseId: number;

  @IsArray() 
  @ArrayNotEmpty()
  groupIds: number[];
}
