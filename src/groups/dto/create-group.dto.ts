import { IsString, IsArray, IsNumber } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  name: string;

  @IsArray()
  @IsNumber({}, { each: true })
  courses: number[];  // Array of course IDs

  @IsArray()
  @IsNumber({}, { each: true })
  students: number[];  // Array of student IDs

  @IsArray()
  @IsNumber({}, { each: true })
  teachers: number[];  // Array of teacher IDs
}
