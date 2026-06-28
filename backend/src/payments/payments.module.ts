import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { AuditModule } from '../audit/audit.module';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SignatureGuard } from './guards/signature.guard';

@Module({
  imports: [AuditModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, JwtAuthGuard, SignatureGuard],
})
export class PaymentsModule {}


