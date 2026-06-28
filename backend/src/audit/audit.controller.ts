import { Controller, Get, Post, Query, Body, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('audit')
@UseGuards(JwtAuthGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('logs')
  getLogs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('paymentId') paymentId?: string,
  ) {
    const pageNumber = parseInt(page || '1', 10);
    const limitNumber = parseInt(limit || '10', 10);
    return this.auditService.getLogs(pageNumber, limitNumber, paymentId);
  }

  @Post('verify')
  verifyLedger() {
    return this.auditService.verifyLedger();
  }

  @Post('tamper')
  tamperLog(@Body() body: { index: number; amount: string }) {
    return this.auditService.tamperLog(body.index, body.amount);
  }
}

