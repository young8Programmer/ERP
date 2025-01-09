import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt, // Raqam kutilmoqda
} from 'class-validator';

export class CreateLessonDto {
  @IsString()
  @IsNotEmpty()
  title: string; // Darslikning sarlavhasi

  @IsString()
  @IsOptional()
  content?: string; // Darslikning mazmuni

  // groupId integer (raqam) bo'lishi kerak
  @IsInt() // Raqam kutilmoqda
  groupId: number; // Guruh ID raqam bo'lishi kerak
}
