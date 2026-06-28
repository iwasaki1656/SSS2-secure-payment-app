export interface User {
  id: string;
  email: string;
  password: string; // Stored as bcrypt hash — never plaintext
  role: 'USER' | 'ADMIN';
  balance: number; // Added balance for internal mock checks
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
