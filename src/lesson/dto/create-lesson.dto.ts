import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsOptional, IsInt, IsDateString, IsArray, ValidateNested } from 'class-validator';
import { CreateAttendanceDto } from 'src/attendance/dto/create-attendance.dto';  // to'g'ri import
import { Attendance } from 'src/attendance/entities/attendance.entity'; // Agar boshqa entity bo'lsa, undan foydalanish o'rinli emas

export class CreateLessonDto {
  @IsString()
  @IsNotEmpty()
  lessonName: string;

  @IsString()
  @IsNotEmpty()
  lessonNumber: string;

  @IsInt()
  @IsNotEmpty()
  groupId: number;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAttendanceDto)
  attendance: CreateAttendanceDto[];
}
