import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAuthDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsString()
  teacherId?: number;

  @IsOptional()
  @IsString()
  studentId?: number;
}
