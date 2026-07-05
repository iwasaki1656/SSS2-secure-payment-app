export interface User {
  id: string;
  email: string;         // Decrypted in-memory representation
  emailEncrypted: string; // AES-256-GCM encrypted — what is persisted at rest
  username: string;
  password: string; // Stored as bcrypt hash — never plaintext
  // Security: Transaction PIN — hashed with bcrypt, required to authorize fund transfers
  transactionPin?: string;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'BANNED' | 'LIMITED';
  balance: Record<string, number>;
  profilePicture?: string;
  // Security: Brute-force protection — track failed logins and lockout
  failedLoginAttempts: number;
  lockoutUntil?: Date;
}

export interface Payment {
  paymentId: string;
  senderId: string;
  recipientId: string;
  amount: string;
  currency: string;
  description: string;
  idempotencyKey: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
}

export interface AuditLog {
  logId: string;
  paymentId: string;
  event: string;
  actor: string;
  timestamp: string;
  checksum: string;
  prevChecksum: string;
}
