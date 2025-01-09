import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsNotEmpty()
  teacherId: number; // Teacher ID raqam ko‘rinishida bo‘ladi
}
