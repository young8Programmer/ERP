import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAssignmentDto {
  @IsInt()
  group_id: number;

  @IsInt()
  lesson_id: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  dueDate?: string; // Sana

  @IsOptional()
  status?: string;
}
