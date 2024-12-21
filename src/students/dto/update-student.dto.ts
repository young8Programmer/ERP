import { isInt, IsOptional, IsString, IsArray, ArrayNotEmpty, IsInt } from 'class-validator';

export class UpdateStudentDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsInt()
  @IsOptional()
  courseId?: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsOptional()
  groupIds: number[];
}
