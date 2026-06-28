import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import * as crypto from 'crypto';

// Mirrors the sortObjectKeys function in frontend/app/utils/crypto.ts
// Both sides must produce identical JSON before hashing for HMAC to match
function sortObjectKeys(obj: any): any {
  if (typeof obj !== 'object' || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(sortObjectKeys);
  return Object.keys(obj)
    .sort()
    .reduce((result: Record<string, any>, key: string) => {
      result[key] = sortObjectKeys(obj[key]);
      return result;
    }, {});
}

@Injectable()
export class SignatureGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const signature = request.headers['x-signature'];

    if (!signature) {
      throw new BadRequestException({ code: 'INVALID_SIGNATURE', message: 'Missing signature' });
    }

    // Security: signing secret loaded from environment, never hardcoded
    const secret = this.configService.get<string>('PAYMENT_SIGNING_SECRET') || 'proto_payment_secret_2026_super_secure';
    // Sort keys to match frontend calculateHmac deterministic serialization
    const sortedBody = sortObjectKeys(request.body);
    const payload = JSON.stringify(sortedBody);
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    if (signature !== expectedSignature) {
      throw new BadRequestException({
        code: 'INVALID_SIGNATURE',
        message: `Invalid signature. Expected: ${expectedSignature}, Received: ${signature}. Payload: ${payload}. Secret: ${secret}`
      });
    }

    return true;
  }
}

