// create-assignment.dto.ts
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAssignmentDto {
  @IsInt()
  group_id: number;

  @IsInt()
  lesson_id: number;

  @IsString()
  @IsNotEmpty()
  assignment: string;

  @IsOptional()
  @IsInt()
  dueDate?: number; // kunlar soni
}
