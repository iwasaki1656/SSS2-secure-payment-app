import { IsString, IsNotEmpty, IsOptional, Min, IsNumberString, Matches } from 'class-validator';

export class TransferDto {
  @IsString()
  @IsNotEmpty()
  senderId!: string;

  @IsString()
  @IsNotEmpty()
  recipientId!: string;

  @IsNumberString()
  @IsNotEmpty()
  amount!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z]{3}$/, { message: 'Currency must follow ISO 4217 (e.g., USD)' })
  currency!: string;

  @IsOptional()
  @IsString()
  description?: string;
}
