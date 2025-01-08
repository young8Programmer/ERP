import { IsString, IsInt, IsNotEmpty, IsDate, IsOptional } from 'class-validator';

export class CreateLessonDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  @IsDate()
  @IsOptional() // yoki @IsNotEmpty() agar zarur bo'lsa
  dueDate: Date;

  @IsInt()
  @IsNotEmpty()
  groupId: number;
}
