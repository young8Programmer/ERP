import {
  IsOptional,
  IsString,
  IsPhoneNumber,
  Length,
  IsInt,
} from 'class-validator';

export class UpdateStudentDto {
  @IsString()
  @IsOptional()
  @Length(3, 50)
  firstName?: string;

  @IsString()
  @IsOptional()
  @Length(3, 50)
  lastName?: string;

  @IsPhoneNumber()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsInt()
  @IsOptional()
  courseId?: number; // Kurs ID'si (yangilash uchun ixtiyoriy)

  @IsInt()
  @IsOptional()
  groupId?: number; // Guruh ID'si (yangilash uchun ixtiyoriy)
}
