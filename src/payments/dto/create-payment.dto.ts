// DTOs
import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  IsDateString,
  MaxLength,
  IsOptional,
  IsIn,
} from 'class-validator';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  user_id: number;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;

  @IsNotEmpty()
  @IsDateString()
  payment_date: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  payment_method: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  promo_code?: string;

  @IsOptional()
  @IsString()
  @IsIn(['pending', 'completed', 'failed'])
  status?: string;
}
