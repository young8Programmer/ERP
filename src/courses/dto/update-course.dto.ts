import { IsString, IsInt, Min, Max, Length } from 'class-validator';


export class UpdateCourseDto {
  @IsString()
  name?: string;

  @IsString()
  @Length(10, 500)
  description?: string;
}