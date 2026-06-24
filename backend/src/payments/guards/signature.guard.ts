import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import * as crypto from 'crypto';

@Injectable()
export class SignatureGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const signature = request.headers['x-signature'];

    if (!signature) {
      throw new BadRequestException({ code: 'INVALID_SIGNATURE', message: 'Missing signature' });
    }

    const payload = JSON.stringify(request.body);
    const expectedSignature = crypto
      .createHmac('sha256', 'SUPER_SECRET_PROTOTYPE_KEY_123!')
      .update(payload)
      .digest('hex');

    if (signature !== expectedSignature) {
      throw new BadRequestException({ code: 'INVALID_SIGNATURE', message: 'Invalid signature' });
    }

    return true;
  }
}
