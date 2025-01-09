import {
  IsString,
  IsInt,
  IsNotEmpty,
  IsDate,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CreateLessonDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  @IsDate()
  @IsOptional()
  dueDate: Date;

  @IsInt()
  @IsNotEmpty()
  groupId: number;

  @IsOptional() // Bu optional bo'ladi
  @IsDateString()
  endDate?: string;
}
