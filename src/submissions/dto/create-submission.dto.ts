import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Express } from 'express';

export class CreateSubmissionDto {
  @IsOptional()
  @ApiProperty({ type: 'string', required: false }) 
  comment?: string;

  @IsNotEmpty()
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}
