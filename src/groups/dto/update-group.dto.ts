import { IsOptional, IsString, IsArray, ArrayNotEmpty, IsNumber } from 'class-validator';
import { Course } from '../../courses/entities/course.entity';
import { Student } from '../../students/entities/user.entity';
import { Teacher } from '../../teacher/entities/teacher.entity';

export class UpdateGroupDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber()
  courses?: number[];  // Array of course IDs

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber()
  students?: number[];  // Array of student IDs

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber()
  teachers?: number[];  // Array of teacher IDs
}
