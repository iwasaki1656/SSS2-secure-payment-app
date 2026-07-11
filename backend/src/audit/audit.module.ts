import { Module } from '@nestjs/common';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthModule } from '../auth/auth.module'; // Import AuthModule to provide AuthService for JwtAuthGuard

@Module({
  imports: [AuthModule],
  controllers: [AuditController],
  providers: [AuditService, JwtAuthGuard],
  exports: [AuditService],
})
export class AuditModule {}
