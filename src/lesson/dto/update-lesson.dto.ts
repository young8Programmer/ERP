import { PartialType } from '@nestjs/mapped-types';
import { CreateLessonDto } from './create-lesson.dto';
import { IsDate, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateLessonDto {
  @IsString()
  @IsOptional()
  title?: string; // Sarlavhani yangilash

  @IsString()
  @IsOptional()
  content?: string; // Mazmunni yangilash

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  dueDate?: Date; // Tugash sanasini yangilash
}
