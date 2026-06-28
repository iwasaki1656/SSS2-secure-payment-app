import { Module } from '@nestjs/common';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Module({
  controllers: [AuditController],
  providers: [AuditService, JwtAuthGuard],
  exports: [AuditService],
})
export class AuditModule {}

