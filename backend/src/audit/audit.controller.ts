import { Controller, Get, Query } from '@nestjs/common';
import { AuditService } from './audit.service';

@Controller('audit')
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
}
