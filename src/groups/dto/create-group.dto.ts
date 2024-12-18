import { IsString, IsNumber, IsArray } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  name: string;

  @IsNumber()
  courseId: number; // Bitta kurs ID

  @IsNumber()
  teacherId: number; // Bitta o'qituvchi ID

  @IsArray()
  @IsNumber({}, { each: true })
  students: number[]; // Array of student IDs
}