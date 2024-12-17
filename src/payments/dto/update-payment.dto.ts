import { IsDateString, IsIn, IsNumber, IsOptional, IsPositive, IsString, MaxLength } from "class-validator";

export class UpdatePaymentDto {
  @IsOptional()
  @IsNumber()
  @IsPositive()
  amount?: number;

  @IsOptional()
  @IsDateString()
  payment_date?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  payment_method?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  promo_code?: string;

  @IsOptional()
  @IsString()
  @IsIn(['pending', 'completed', 'failed'])
  status?: string;
}
