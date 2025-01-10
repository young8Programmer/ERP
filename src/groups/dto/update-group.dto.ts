import { IsOptional, IsString, IsNumber, IsArray } from 'class-validator';

export class UpdateGroupDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  courseId?: number; // Bitta kurs ID

  @IsOptional()
  @IsNumber()
  teacherId?: number; // Bitta o'qituvchi ID

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  students?: number[]; // Array of student IDs
}
