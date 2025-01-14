import { IsString, IsNotEmpty, IsOptional, IsInt, IsDateString, IsArray, ValidateNested } from 'class-validator';

export class CreateAttendanceDto {
  @IsInt()
  @IsNotEmpty()
  studentId: number;

  @IsNotEmpty()
  status: boolean;
}

