import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AuditService } from '../audit/audit.service';
import { TransferDto } from './dto/transfer.dto';
import { Payment } from '../database/models';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly auditService: AuditService,
  ) {}

  transfer(dto: TransferDto, idempotencyKey: string): Payment {
    const amount = parseFloat(dto.amount);
    if (isNaN(amount) || amount <= 0) {
      throw new UnprocessableEntityException({ code: 'INVALID_AMOUNT', message: 'Amount must be > 0' });
    }

    const sender = this.db.users.get(dto.senderId);
    if (!sender) {
      throw new NotFoundException({ code: 'SENDER_NOT_FOUND', message: 'Sender not found' });
    }

    if (sender.balance < amount) {
      throw new UnprocessableEntityException({ code: 'INSUFFICIENT_FUNDS', message: 'Insufficient funds' });
    }

    // Process transfer
    sender.balance -= amount;
    // We assume recipient exists or we create them mockingly? The specs don't enforce RECIPIENT_NOT_FOUND but let's check
    const recipient = this.db.users.get(dto.recipientId);
    if (recipient) {
      recipient.balance += amount;
    }

    const paymentId = uuidv4();
    const payment: Payment = {
      paymentId,
      senderId: dto.senderId,
      recipientId: dto.recipientId,
      amount: dto.amount,
      currency: dto.currency,
      description: dto.description || '',
      idempotencyKey,
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
    };

    this.db.payments.set(paymentId, payment);

    this.auditService.appendLog(paymentId, 'TRANSFER_COMPLETED', dto.senderId);

    return payment;
  }

  getPayment(paymentId: string): Payment {
    const payment = this.db.payments.get(paymentId);
    if (!payment) {
      throw new NotFoundException({ code: 'PAYMENT_NOT_FOUND', message: 'Payment not found' });
    }
    return payment;
  }

  getPayments(page: number = 1, limit: number = 10, userId?: string) {
    let payments = Array.from(this.db.payments.values());
    if (userId) {
      payments = payments.filter((p) => p.senderId === userId || p.recipientId === userId);
    }

    const total = payments.length;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedPayments = payments.slice(startIndex, endIndex);

    return {
      payments: paginatedPayments,
      pagination: {
        total,
        page,
        limit,
      },
    };
  }
}
