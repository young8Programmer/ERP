import { IsNotEmpty, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Express } from 'express';

export class CreateSubmissionDto {
  @IsOptional()
  @ApiProperty({ type: 'string', required: false }) // 🔹 Izoh ixtiyoriy bo'lishi mumkin
  comment?: string;
}
