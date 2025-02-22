import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAssignmentDto {
  @IsInt()
  group_id: number;

  @IsInt()
  lesson_id: number;

  @IsString()
  @IsNotEmpty()
  title: string; // Mavzu qo'shildi

  @IsOptional()
  @IsString()
  description?: string; // Izoh qo'shildi

  @IsOptional()
  @IsString()
  fileUrl?: string; // Fayl yuklash uchun URL qo'shildi

  @IsString()
  @IsNotEmpty()
  assignment: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  status?: string; // Default "pending" bo'lishi mumkin
}
