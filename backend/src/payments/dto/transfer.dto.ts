import { IsString, IsNotEmpty, IsOptional, IsNumberString, Matches } from 'class-validator';

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

  // Security: Transaction PIN — required if the sender has set one
  @IsOptional()
  @IsString()
  transactionPin?: string;

  // Security: Email 2FA — verification ID returned by /transfer/request-code
  @IsString()
  @IsNotEmpty()
  verificationId!: string;

  // Security: Email 2FA — 6-digit code sent to user's email
  @IsString()
  @IsNotEmpty()
  verificationCode!: string;
}
