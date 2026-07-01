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

    // Resolve sender by ID
    const sender = this.db.users.get(dto.senderId);
    if (!sender) {
      throw new NotFoundException({ code: 'SENDER_NOT_FOUND', message: 'Sender not found' });
    }

    // Resolve recipient by ID, email, or username (free-text entry support)
    const recipient = this.db.findUser(dto.recipientId);
    if (!recipient) {
      throw new NotFoundException({ code: 'RECIPIENT_NOT_FOUND', message: 'Recipient not found. Please check the email, username, or ID entered.' });
    }

    if (sender.id === recipient.id) {
      throw new UnprocessableEntityException({ code: 'SELF_TRANSFER', message: 'Cannot transfer funds to yourself.' });
    }

    const currency = dto.currency;

    // Security Fix: Validate balance against the specific currency being sent
    const senderCurrencyBalance = sender.balance[currency] ?? 0;
    if (senderCurrencyBalance < amount) {
      throw new UnprocessableEntityException({
        code: 'INSUFFICIENT_FUNDS',
        message: `Insufficient ${currency} funds. Available: ${senderCurrencyBalance.toFixed(2)} ${currency}`,
      });
    }

    // Process transfer — update in-memory balances for both parties
    sender.balance[currency] = parseFloat((senderCurrencyBalance - amount).toFixed(2));

    const recipientCurrencyBalance = recipient.balance[currency] ?? 0;
    recipient.balance[currency] = parseFloat((recipientCurrencyBalance + amount).toFixed(2));

    const paymentId = uuidv4();
    const payment: Payment = {
      paymentId,
      senderId: sender.id,
      recipientId: recipient.id, // Always store the canonical user ID
      amount: dto.amount,
      currency: dto.currency,
      description: dto.description || '',
      idempotencyKey,
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
    };

    this.db.payments.set(paymentId, payment);

    this.auditService.appendLog(paymentId, 'TRANSFER_COMPLETED', sender.id);

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
