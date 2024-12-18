import { IsNotEmpty, IsString, IsArray, ArrayNotEmpty, IsNumber } from 'class-validator';
import { Course } from '../../courses/entities/course.entity';
import { Student } from '../../students/entities/user.entity';
import { Teacher } from '../../teacher/entities/teacher.entity';

export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsNumber()
  courses: number[]; 

  @IsArray()
  @ArrayNotEmpty()
  @IsNumber()
  students: number[];

  @IsArray()
  @ArrayNotEmpty()
  @IsNumber()
  teachers: number[];
}
