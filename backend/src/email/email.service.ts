import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    // Security: Gmail SMTP credentials loaded from environment variables
    // To configure: set GMAIL_USER and GMAIL_APP_PASSWORD in backend/.env
    const user = this.configService.get<string>('GMAIL_USER');
    const pass = this.configService.get<string>('GMAIL_APP_PASSWORD');
    
    if (user && pass) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
      });
    }
  }

  /**
   * Send a 6-digit verification code to the specified email address.
   * Used for two-factor authentication during fund transfers.
   */
  async sendVerificationCode(to: string, code: string): Promise<void> {
    // [DEV MODE] Print the 2FA code to the terminal for easy local testing
    console.log(`\n\n========================================`);
    console.log(`[DEV MODE] 2FA Verification Code for ${to}: ${code}`);
    console.log(`========================================\n\n`);

    if (!this.transporter) return;

    const from = this.configService.get<string>('GMAIL_USER');

    await this.transporter.sendMail({
      from: `"SecurePay 2FA" <${from}>`,
      to,
      subject: '【SecurePay】Transfer Verification Code',
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0a0f1d; border-radius: 16px; color: #e4e4e7;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #22d3ee; font-size: 24px; margin: 0;">🔐 Transfer Verification Code</h1>
            <p style="color: #a1a1aa; font-size: 13px; margin-top: 8px;">Please enter this code to authorize your transfer</p>
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

  /**
   * Send a notification email to the recipient when they receive funds.
   * Includes sender information and the amount received.
   */
  async sendTransferNotification(
    recipientEmail: string,
    senderName: string,
    amount: string,
    currency: string,
    description: string,
  ): Promise<void> {
    if (!this.transporter) return;
    const from = this.configService.get<string>('GMAIL_USER');

    await this.transporter.sendMail({
      from: `"SecurePay" <${from}>`,
      to: recipientEmail,
      subject: `【SecurePay】You received ${amount} ${currency} from ${senderName}`,
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0a0f1d; border-radius: 16px; color: #e4e4e7;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #34d399; font-size: 24px; margin: 0;">💰 Payment Received</h1>
            <p style="color: #a1a1aa; font-size: 13px; margin-top: 8px;">You have received a new transfer</p>
          </div>
          <div style="background: #1e293b; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="color: #a1a1aa; padding: 8px 0; border-bottom: 1px solid #334155;">From</td>
                <td style="color: #e4e4e7; padding: 8px 0; border-bottom: 1px solid #334155; text-align: right; font-weight: bold;">${senderName}</td>
              </tr>
              <tr>
                <td style="color: #a1a1aa; padding: 8px 0; border-bottom: 1px solid #334155;">Amount</td>
                <td style="color: #34d399; padding: 8px 0; border-bottom: 1px solid #334155; text-align: right; font-weight: bold; font-size: 18px;">+${parseFloat(amount).toLocaleString()} ${currency}</td>
              </tr>
              ${
                description
                  ? `
              <tr>
                <td style="color: #a1a1aa; padding: 8px 0;">Description</td>
                <td style="color: #e4e4e7; padding: 8px 0; text-align: right;">${description}</td>
              </tr>
              `
                  : ''
              }
            </table>
          </div>
          <div style="background: #0f2a1d; border-radius: 8px; padding: 16px; border-left: 3px solid #34d399; margin-bottom: 16px;">
            <p style="color: #34d399; font-size: 12px; margin: 0 0 4px 0; font-weight: bold;">✅ Transfer Complete</p>
            <p style="color: #a1a1aa; font-size: 11px; margin: 0; line-height: 1.6;">
              The funds have been added to your ${currency} balance. Log in to SecurePay to view your updated balance.
            </p>
          </div>
          <div style="background: #1a1a2e; border-radius: 8px; padding: 16px; border-left: 3px solid #f59e0b;">
            <p style="color: #fbbf24; font-size: 12px; margin: 0 0 4px 0; font-weight: bold;">⚠️ Security Notice</p>
            <p style="color: #a1a1aa; font-size: 11px; margin: 0; line-height: 1.6;">
              If you do not recognize this transfer, please contact support immediately.
            </p>
          </div>
          <p style="color: #71717a; font-size: 10px; text-align: center; margin-top: 24px;">
            This email was sent automatically by SecurePay. Do not reply.
          </p>
        </div>
      `,
    });
  }
}
