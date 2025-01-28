import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class logoutDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;
}
