import { IsString, IsInt, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateAssignmentDto {
  @IsInt()
  @IsNotEmpty()
  group_id: number;

  @IsInt()
  @IsNotEmpty()
  lesson_id: number;

  @IsString()
  @IsNotEmpty()
  assignment: string;

  @IsDateString()
  @IsNotEmpty()
  dueDate: string;
}
