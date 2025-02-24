import { IsNotEmpty, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Express } from 'express';

export class CreateSubmissionDto {
  @IsNotEmpty()
  @ApiProperty({ type: 'string', format: 'binary' }) // 🟢 Fayl yuklash uchun
  file: any;

  @IsOptional()
  @ApiProperty({ type: 'string', required: false }) // 🔹 Izoh ixtiyoriy bo'lishi mumkin
  comment?: string;
}
