// create-assignment.dto.ts
import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAssignmentDto {
  @IsInt()
  group_id: number;

  @IsInt()
  lesson_id: number;

  @IsString()
  @IsNotEmpty()
  assignment: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string; // kunlar soni
}
