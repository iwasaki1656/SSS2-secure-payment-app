import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { PaymentsModule } from './payments/payments.module';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [DatabaseModule, AuthModule, PaymentsModule, AuditModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
