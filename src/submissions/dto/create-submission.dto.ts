import {
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  IsOptional,
} from 'class-validator';

export class CreateSubmissionDto {
  @IsInt()
  @IsNotEmpty()
  studentId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  studentName: string;

  @IsInt()
  @IsNotEmpty()
  assignmentId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  file: string;

  @IsString()
  @IsNotEmpty() // Ensure this is not empty
  @MaxLength(1000) // Adjust the length limit if needed
  content: string; // Add this field to the DTO
}
