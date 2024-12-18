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
  @IsNumber({}, { each: true })
  courses: number[];  // Array of course IDs

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  students: number[];  // Array of student IDs

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  teachers: number[];  // Array of teacher IDs
}
