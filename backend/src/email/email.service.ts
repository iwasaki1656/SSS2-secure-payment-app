import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    // Security: Gmail SMTP credentials loaded from environment variables
    // To configure: set GMAIL_USER and GMAIL_APP_PASSWORD in backend/.env
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('GMAIL_USER'),
        pass: this.configService.get<string>('GMAIL_APP_PASSWORD'),
      },
    });
  }

  /**
   * Send a 6-digit verification code to the specified email address.
   * Used for two-factor authentication during fund transfers.
   */
  async sendVerificationCode(to: string, code: string): Promise<void> {
    const from = this.configService.get<string>('GMAIL_USER');

    await this.transporter.sendMail({
      from: `"SecurePay 2FA" <${from}>`,
      to,
      subject: '【SecurePay】Transfer Verification Code',
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0a0f1d; border-radius: 16px; color: #e4e4e7;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #22d3ee; font-size: 24px; margin: 0;">🔐 Transfer Verification Code</h1>
            <p style="color: #a1a1aa; font-size: 13px; margin-top: 8px;">Transfer Verification Code</p>
          </div>
          <div style="background: #1e293b; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <p style="color: #a1a1aa; font-size: 13px; margin: 0 0 12px 0;">Your verification code is:</p>
            <div style="font-size: 36px; font-weight: bold; letter-spacing: 12px; color: #22d3ee; font-family: 'Courier New', monospace; padding: 12px 0;">
              ${code}
            </div>
          </div>
          <div style="background: #1a1a2e; border-radius: 8px; padding: 16px; border-left: 3px solid #f59e0b;">
            <p style="color: #fbbf24; font-size: 12px; margin: 0 0 4px 0; font-weight: bold;">⚠️ Security Notice</p>
            <ul style="color: #a1a1aa; font-size: 11px; margin: 0; padding-left: 16px; line-height: 1.6;">
              <li>This code expires in <strong style="color: #e4e4e7;">5 minutes</strong>.</li>
              <li>Do not share this code with anyone.</li>
              <li>You have <strong style="color: #e4e4e7;">3 attempts</strong> to enter this code correctly.</li>
              <li>If you did not request this code, please ignore this email.</li>
            </ul>
          </div>
          <p style="color: #71717a; font-size: 10px; text-align: center; margin-top: 24px;">
            This email was sent automatically by SecurePay. Do not reply.
          </p>
        </div>
      `,
    });
  }
}
