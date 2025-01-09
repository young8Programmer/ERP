import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSubmissionDto {
  @IsNotEmpty()
  @IsString()
  content: string; // Topshiriq javobi (fayl URL yoki matn)

  @IsNotEmpty()
  assignmentId: number; // Qaysi topshiriqqa tegishli
}
