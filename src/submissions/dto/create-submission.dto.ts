import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSubmissionDto {
  @IsNotEmpty()
  @IsString()
  fileUrl: string; // Yuklangan fayl (rasm, hujjat)

  @IsNotEmpty()
  @IsString()
  comment: string; // O‘quvchining izohi
}
