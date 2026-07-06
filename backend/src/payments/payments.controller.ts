import { Controller, Post, Get, Body, Param, Query, UseGuards, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { TransferDto } from './dto/transfer.dto';
import { RequestCodeDto } from './dto/request-code.dto';
import { ResendCodeDto } from './dto/resend-code.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SignatureGuard } from './guards/signature.guard';
import { IdempotencyGuard } from './guards/idempotency.guard';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // Security: 2FA — Request a verification code before transfer
  @Post('transfer/request-code')
  @HttpCode(HttpStatus.OK)
  requestVerificationCode(@Body() dto: RequestCodeDto) {
    return this.paymentsService.requestVerificationCode(dto.senderId);
  }

  // Security: 2FA — Resend verification code (generates a new one)
  @Post('transfer/resend-code')
  @HttpCode(HttpStatus.OK)
  resendVerificationCode(@Body() dto: ResendCodeDto) {
    return this.paymentsService.resendVerificationCode(dto.verificationId);
  }

  @Post('transfer')
  @HttpCode(HttpStatus.OK)
  @UseGuards(SignatureGuard, IdempotencyGuard)
  transfer(
    @Body() transferDto: TransferDto,
    @Headers('x-idempotency-key') idempotencyKey: string,
  ) {
    return this.paymentsService.transfer(transferDto, idempotencyKey);
  }

  @Get(':paymentId')
  getPayment(@Param('paymentId') paymentId: string) {
    return this.paymentsService.getPayment(paymentId);
  }

  @Get()
  getPayments(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('userId') userId?: string,
  ) {
    const pageNumber = parseInt(page || '1', 10);
    const limitNumber = parseInt(limit || '10', 10);
    return this.paymentsService.getPayments(pageNumber, limitNumber, userId);
  }
}
