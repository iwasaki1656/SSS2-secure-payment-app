import { Controller, Get, Post, Query, Body, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';

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

  // Security (RBAC): Hash chain integrity verification is restricted to ADMIN only.
  // A normal USER must not be able to run or see audit verification results.
  @Post('verify')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  verifyLedger() {
    return this.auditService.verifyLedger();
  }

  // Security (RBAC): Database tampering simulation is allowed for USERs in this educational sandbox.
  // In a real application, exposing this to normal USERs would be a critical security vulnerability.
  @Post('tamper')
  @UseGuards(RolesGuard)
  @Roles('USER')
  tamperLog(@Body() body: { index: number; amount: string }) {
    return this.auditService.tamperLog(body.index, body.amount);
  }
}
