import { IsString, IsNotEmpty, IsOptional, IsInt, IsDateString, IsArray, ValidateNested, isBoolean, IsBoolean } from 'class-validator';

export class CreateAttendanceDto {
  @IsInt()
  studentId: number;

  @IsBoolean()
  status: boolean;
}

