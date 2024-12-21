import { IsOptional, IsString, } from 'class-validator';
export class UpdateStudentDto {
  @IsString()
  firstName?: string;

  @IsString()
  lastName?: string;

  phone?: string;

  @IsString()
  address?: string;

  @IsString()
  courseId?: number;

  
  @IsString()
  groupIds?: number[];
}