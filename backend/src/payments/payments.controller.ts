import { Controller, Post, Get, Body, Param, Query, UseGuards, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { TransferDto } from './dto/transfer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SignatureGuard } from './guards/signature.guard';
import { IdempotencyGuard } from './guards/idempotency.guard';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

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
