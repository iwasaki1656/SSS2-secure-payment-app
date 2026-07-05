import { IsEmail, IsNotEmpty, IsString, MinLength, Matches, IsOptional } from 'class-validator';

// Blocklist of common fake/disposable email domains
const BLOCKED_DOMAINS = [
  'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'throwam.com',
  'yopmail.com', 'sharklasers.com', 'guerrillamailblock.com', 'grr.la',
  'guerrillamail.info', 'guerrillamail.biz', 'guerrillamail.de', 'guerrillamail.net',
  'guerrillamail.org', 'spam4.me', 'trashmail.com', 'dispostable.com', 'fakeinbox.com',
  'mailnull.com', 'spamgourmet.com', 'trashmail.at', 'trashmail.io', 'trashmail.me',
  'maildrop.cc', 'discard.email', 'spambox.us', 'throwam.com', 'mintemail.com',
];

export function isBlockedEmailDomain(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  return domain ? BLOCKED_DOMAINS.includes(domain) : false;
}

export class SignupDto {
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Username must be at least 3 characters.' })
  @Matches(/^[a-zA-Z0-9_]+$/, { message: 'Username can only contain letters, numbers, and underscores.' })
  username!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(12, { message: 'Password must be at least 12 characters long.' })
  @Matches(
    /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~])/,
    {
      message:
        'Password must include at least one letter, one number, and one special character (e.g. !@#$%^&*).',
    },
  )
  password!: string;

  // Security: Transaction PIN — optional at signup, must be exactly 4 digits
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}$/, { message: 'Transaction PIN must be exactly 4 digits.' })
  transactionPin?: string;
}
