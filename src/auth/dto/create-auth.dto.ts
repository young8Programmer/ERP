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
  teacherId?: number;

  @IsOptional()
  studentId?: number;
}
