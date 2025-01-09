import { IsNotEmpty, IsNumber, Min, Max } from 'class-validator';

export class GradeSubmissionDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100) // Maksimal baho 100 deb belgiladik, kerak bo'lsa o'zgartirish mumkin
  grade: number; // Baxo qiymati
}
