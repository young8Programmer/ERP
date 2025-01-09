import { IsNotEmpty, IsNumber, Min, Max } from 'class-validator';
export class GradeSubmissionDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  grade: number
}
