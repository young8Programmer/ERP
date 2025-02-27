import { IsNotEmpty, IsNumber, Min, Max, IsString } from 'class-validator';

export class GradeSubmissionDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  grade: number; // Baho

  @IsNotEmpty()
  @IsString()
  comment: string; // Ustozning izohi
}
