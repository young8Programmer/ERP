
// GroupUpdateDto.ts
import { IsString, Length, IsOptional } from 'class-validator';

export class GroupUpdateDto {
  @IsString()
  @Length(5, 100)
  @IsOptional()
  name?: string;
}