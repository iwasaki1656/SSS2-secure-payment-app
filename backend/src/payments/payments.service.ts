import { Injectable, NotFoundException, UnprocessableEntityException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AuditService } from '../audit/audit.service';
import { TransferDto } from './dto/transfer.dto';
import { Payment } from '../database/models';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';

// ─── Fraud Detection Limits ───────────────────────────────────────────────────
const SINGLE_TX_LIMIT = 20000;    // Max amount per single transaction
const DAILY_LIMIT = 50000;        // Max total transferred in a 24-hour window

@Injectable()
export class PaymentsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly auditService: AuditService,
  ) {}

  async transfer(dto: TransferDto, idempotencyKey: string): Promise<Payment> {
    const amount = parseFloat(dto.amount);
    if (isNaN(amount) || amount <= 0) {
      throw new UnprocessableEntityException({ code: 'INVALID_AMOUNT', message: 'Amount must be > 0' });
    }

    // Resolve sender by ID
    const sender = this.db.users.get(dto.senderId);
    if (!sender) {
      throw new NotFoundException({ code: 'SENDER_NOT_FOUND', message: 'Sender not found' });
    }

    if (sender.status === 'LIMITED') {
      throw new UnprocessableEntityException({ code: 'ACCOUNT_LIMITED', message: 'Your account is currently limited. You cannot initiate transfers.' });
    }

    // Security: Transaction PIN Validation
    // If the sender has set a PIN, they MUST provide the correct one to proceed.
    if (sender.transactionPin) {
      if (!dto.transactionPin) {
        throw new ForbiddenException({ code: 'PIN_REQUIRED', message: 'A Transaction PIN is required to authorize this transfer. Please enter your 4-digit PIN.' });
      }
      const pinValid = await bcrypt.compare(dto.transactionPin, sender.transactionPin);
      if (!pinValid) {
        throw new ForbiddenException({ code: 'INVALID_PIN', message: 'Incorrect Transaction PIN. Transfer blocked.' });
      }
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

    // Security: Fraud Detection — Single Transaction Limit
    if (amount > SINGLE_TX_LIMIT) {
      throw new UnprocessableEntityException({
        code: 'FRAUD_SINGLE_TX_LIMIT',
        message: `Transfer blocked: Single transaction limit is ${SINGLE_TX_LIMIT.toLocaleString()} ${currency}. For large transfers, please contact support.`,
      });
    }

    // Security: Fraud Detection — Daily Velocity Limit (rolling 24-hour window)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const dailyTotal = Array.from(this.db.payments.values())
      .filter((p) => p.senderId === sender.id && p.currency === currency && p.status === 'COMPLETED' && p.createdAt >= oneDayAgo)
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);

    if (dailyTotal + amount > DAILY_LIMIT) {
      const remaining = Math.max(0, DAILY_LIMIT - dailyTotal);
      throw new UnprocessableEntityException({
        code: 'FRAUD_DAILY_LIMIT',
        message: `Transfer blocked: Daily transfer limit of ${DAILY_LIMIT.toLocaleString()} ${currency} reached. Remaining allowance: ${remaining.toLocaleString()} ${currency}.`,
      });
    }

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
