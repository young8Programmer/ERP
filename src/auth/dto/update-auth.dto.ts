import { PartialType } from '@nestjs/mapped-types';
import { RefreshTokenDto } from './RefreshTokenDto';

export class UpdateAuthDto extends PartialType(RefreshTokenDto) {}
