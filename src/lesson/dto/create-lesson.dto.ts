import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsOptional, IsInt, IsDateString, IsArray, ValidateNested } from 'class-validator';
import { CreateAttendanceDto } from 'src/attendance/dto/create-attendance.dto';
import { Attendance } from 'src/attendance/entities/attendance.entity';


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
  @Type(() => Attendance)
  attendance: CreateAttendanceDto[];
}
