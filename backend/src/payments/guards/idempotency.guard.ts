import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class IdempotencyGuard implements CanActivate {
  constructor(private readonly db: DatabaseService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const idempotencyKey = request.headers['x-idempotency-key'] as string;

    if (!idempotencyKey) {
      throw new BadRequestException({
        code: 'MISSING_IDEMPOTENCY_KEY',
        message: 'X-Idempotency-Key header is required',
      });
    }

    for (const payment of this.db.payments.values()) {
      if (payment.idempotencyKey === idempotencyKey) {
        throw new ConflictException({
          code: 'DUPLICATE_REQUEST',
          message: 'Duplicate request detected',
        });
      }
    }

    return true;
  }
}
