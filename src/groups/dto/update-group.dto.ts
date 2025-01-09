
import { IsOptional, IsString, IsNumber, IsArray } from 'class-validator';

export class UpdateGroupDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  teacherId?: number; // Teacher ID yangilash ixtiyoriy
}
