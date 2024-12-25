import { IsInt, IsNotEmpty } from "class-validator";

export class AddStudentDto {
  @IsInt()
  @IsNotEmpty()
  studentId: number;
}
