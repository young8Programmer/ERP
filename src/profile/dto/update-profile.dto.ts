import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
export class UpdateProfileDto {
    @IsString()
    firstName?: string;
  
    @IsString()
    lastName?: string;
  
    @IsString()
    @IsOptional()
    photo?: string;
  
    @IsString()
    @IsOptional()
    bio?: string;
  
    @IsOptional()
    age?: number;
  
    @IsString()
    @IsOptional()
    contactNumber?: string;
  }
  