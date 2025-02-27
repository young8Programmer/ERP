import { IsBoolean } from 'class-validator';

export class UpdateAttendanceDto {
  @IsBoolean()
  status: boolean;
}
