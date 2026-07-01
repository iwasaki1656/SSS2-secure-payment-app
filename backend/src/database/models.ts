export interface User {
  id: string;
  email: string;
  username: string;
  password: string; // Stored as bcrypt hash — never plaintext
  role: 'USER' | 'ADMIN';
  balance: Record<string, number>; // Currency-specific balances (e.g., { USD: 5000, JPY: 100000 })
  profilePicture?: string; // Optional base64 or URL string
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
