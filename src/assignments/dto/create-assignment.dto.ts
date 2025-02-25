import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateAssignmentDto {
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10)) // ❗ Automatik numberga o‘tkazish
  @IsInt()
  lesson_id: number;

  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10)) // ❗ Automatik numberga o‘tkazish
  @IsInt()
  group_id: number;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  dueDate?: string;
}
