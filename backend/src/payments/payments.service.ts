import { Injectable, NotFoundException, UnprocessableEntityException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AuditService } from '../audit/audit.service';
import { EmailService } from '../email/email.service';
import { TransferDto } from './dto/transfer.dto';
import { Payment } from '../database/models';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';

// ─── Fraud Detection Limits ───────────────────────────────────────────────────
const SINGLE_TX_LIMIT = 20000;    // Max amount per single transaction
const DAILY_LIMIT = 50000;        // Max total transferred in a 24-hour window

// ─── 2FA Verification Constants ───────────────────────────────────────────────
const VERIFICATION_CODE_LENGTH = 6;       // 6-digit numeric code
const VERIFICATION_EXPIRY_MS = 5 * 60 * 1000;  // 5 minutes
const MAX_VERIFICATION_ATTEMPTS = 3;      // Max wrong code attempts

/** In-memory store for pending 2FA verification sessions */
interface VerificationSession {
  code: string;
  senderId: string;
  senderEmail: string;
  attempts: number;
  expiresAt: number;  // Unix timestamp in ms
}

@Injectable()
export class PaymentsService {
  // Security: In-memory map of pending 2FA verification sessions
  private readonly verificationSessions = new Map<string, VerificationSession>();

  constructor(
    private readonly db: DatabaseService,
    private readonly auditService: AuditService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Security: Generate a 6-digit verification code and send it to the sender's email.
   * Returns a verificationId to correlate the code entry with this session.
   */
  async requestVerificationCode(senderId: string): Promise<{ verificationId: string }> {
    const sender = this.db.users.get(senderId);
    if (!sender) {
      throw new NotFoundException({ code: 'SENDER_NOT_FOUND', message: 'Sender not found' });
    }

    if (sender.status === 'LIMITED') {
      throw new UnprocessableEntityException({ code: 'ACCOUNT_LIMITED', message: 'Your account is currently limited.' });
    }

    // Generate cryptographically secure 6-digit code
    const code = this.generateVerificationCode();
    const verificationId = uuidv4();

    // Store the session
    this.verificationSessions.set(verificationId, {
      code,
      senderId,
      senderEmail: sender.email,
      attempts: 0,
      expiresAt: Date.now() + VERIFICATION_EXPIRY_MS,
    });

    // Send the code via email
    await this.emailService.sendVerificationCode(sender.email, code);

    return { verificationId };
  }

  /**
   * Security: Resend a new verification code for an existing session.
   * The old code is invalidated and a new one is generated.
   */
  async resendVerificationCode(verificationId: string): Promise<{ verificationId: string }> {
    const session = this.verificationSessions.get(verificationId);
    if (!session) {
      throw new BadRequestException({ code: 'SESSION_NOT_FOUND', message: 'Verification session not found or expired. Please request a new code.' });
    }

    // Check if already exceeded max attempts
    if (session.attempts >= MAX_VERIFICATION_ATTEMPTS) {
      this.verificationSessions.delete(verificationId);
      throw new ForbiddenException({ code: 'MAX_ATTEMPTS_EXCEEDED', message: 'Maximum verification attempts exceeded. Please start a new transfer.' });
    }

    // Generate a new code (invalidates the old one)
    const newCode = this.generateVerificationCode();
    session.code = newCode;
    session.expiresAt = Date.now() + VERIFICATION_EXPIRY_MS; // Reset expiry
    // Note: attempts counter is NOT reset on resend

    // Send the new code
    await this.emailService.sendVerificationCode(session.senderEmail, newCode);

    return { verificationId };
  }

  async transfer(dto: TransferDto, idempotencyKey: string): Promise<Payment> {
    const amount = parseFloat(dto.amount);
    if (isNaN(amount) || amount <= 0) {
      throw new UnprocessableEntityException({ code: 'INVALID_AMOUNT', message: 'Amount must be > 0' });
    }

    // ─── Security: 2FA Email Verification ──────────────────────────────────
    this.verifyCode(dto.verificationId, dto.verificationCode, dto.senderId);

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

    // Clean up the used verification session
    this.verificationSessions.delete(dto.verificationId);

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

  // ─── Private Helpers ──────────────────────────────────────────────────────

  /** Generate a cryptographically secure 6-digit verification code */
  private generateVerificationCode(): string {
    // crypto.randomInt generates a secure random integer in [0, 10^6)
    return randomInt(0, Math.pow(10, VERIFICATION_CODE_LENGTH)).toString().padStart(VERIFICATION_CODE_LENGTH, '0');
  }

  /**
   * Security: Validate the 2FA verification code.
   * Throws if expired, wrong sender, max attempts exceeded, or incorrect code.
   */
  private verifyCode(verificationId: string, verificationCode: string, senderId: string): void {
    const session = this.verificationSessions.get(verificationId);

    if (!session) {
      throw new BadRequestException({
        code: 'VERIFICATION_SESSION_NOT_FOUND',
        message: 'Verification session not found or expired. Please request a new verification code.',
      });
    }

    // Check expiry
    if (Date.now() > session.expiresAt) {
      this.verificationSessions.delete(verificationId);
      throw new BadRequestException({
        code: 'VERIFICATION_EXPIRED',
        message: 'Verification code has expired. Please request a new code.',
      });
    }

    // Check sender matches
    if (session.senderId !== senderId) {
      throw new ForbiddenException({
        code: 'VERIFICATION_SENDER_MISMATCH',
        message: 'Verification session does not match the sender.',
      });
    }

    // Check max attempts
    if (session.attempts >= MAX_VERIFICATION_ATTEMPTS) {
      this.verificationSessions.delete(verificationId);
      throw new ForbiddenException({
        code: 'MAX_ATTEMPTS_EXCEEDED',
        message: 'Maximum verification attempts (3) exceeded. Please request a new verification code.',
        remainingAttempts: 0,
      } as any);
    }

    // Validate code
    if (session.code !== verificationCode) {
      session.attempts += 1;
      const remaining = MAX_VERIFICATION_ATTEMPTS - session.attempts;

      if (remaining <= 0) {
        this.verificationSessions.delete(verificationId);
        throw new ForbiddenException({
          code: 'INVALID_VERIFICATION_CODE',
          message: `Incorrect verification code. All ${MAX_VERIFICATION_ATTEMPTS} attempts used. Please request a new code.`,
          remainingAttempts: 0,
        } as any);
      }

      throw new ForbiddenException({
        code: 'INVALID_VERIFICATION_CODE',
        message: `Incorrect verification code. ${remaining} attempt(s) remaining.`,
        remainingAttempts: remaining,
      } as any);
    }

    // Code is valid — session will be cleaned up after successful transfer
  }
}
