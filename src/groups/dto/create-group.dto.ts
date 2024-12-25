import { IsString, IsNumber, IsArray, IsOptional } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  name: string;

  @IsNumber()
  courseId: number; // Bitta kurs ID

  @IsOptional()
  @IsNumber()
  teacherId?: number; // Bitta o'qituvchi ID

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  students?: number[]; // Array of student IDs
}
