import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { PaymentsModule } from './payments/payments.module';
import { AuditModule } from './audit/audit.module';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    // Security: Load env variables securely, available globally
    ConfigModule.forRoot({ isGlobal: true }),
    // Security: Rate limiting — max 10 requests per 60 seconds per IP
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }]),
    DatabaseModule,
    AuthModule,
    PaymentsModule,
    AuditModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Security: Apply rate limiting globally to all routes
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}

