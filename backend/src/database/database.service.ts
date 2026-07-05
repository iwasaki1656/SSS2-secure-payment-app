import { Injectable, OnModuleInit } from '@nestjs/common';
import { User, Payment, AuditLog } from './models';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

// ─── Data Encryption at Rest (AES-256-GCM) ───────────────────────────────────
// A real production system would load this key from a KMS (Key Management Service).
// For this prototype, it is loaded from env and falls back to a dev key.
const ENCRYPTION_KEY = Buffer.from(
  process.env.DB_ENCRYPTION_KEY || 'aegispay_dev_key_32bytes_padding!',
  'utf8',
).subarray(0, 32); // Ensure exactly 32 bytes for AES-256

/** Encrypt plaintext string using AES-256-GCM. Returns "iv:authTag:ciphertext" */
function encrypt(plaintext: string): string {
  const iv = randomBytes(12); // 96-bit IV recommended for GCM
  const cipher = createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

/** Decrypt an "iv:authTag:ciphertext" string produced by encrypt() */
function decrypt(ciphertext: string): string {
  const [ivHex, authTagHex, encryptedHex] = ciphertext.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const decipher = createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);
  return decipher.update(encrypted).toString('utf8') + decipher.final('utf8');
}


@Injectable()
export class DatabaseService implements OnModuleInit {
  public users: Map<string, User> = new Map();
  public payments: Map<string, Payment> = new Map();
  public auditLogs: AuditLog[] = [];

  onModuleInit() {
    // Security: Passwords are hashed using bcrypt (salt rounds=12) — never stored in plaintext
    // Rounds of 12 significantly slows down offline dictionary/brute-force attacks vs rounds=10
    const aliceHashedPassword = bcrypt.hashSync('vW8#xK9$mP2!qL5', 12);
    const bobHashedPassword = bcrypt.hashSync('rT4@nZ7&jQ1^cX3', 12);
    // Admin credentials — seeded directly, cannot be created via signup
    const adminHashedPassword = bcrypt.hashSync('Admin@SecureFin2026!', 12);

    // Seed initial users with currency-specific balances matching frontend expectations
    this.users.set('alice_id', {
      id: 'alice_id',
      email: 'alice@example.com',
      emailEncrypted: encrypt('alice@example.com'),
      username: 'alice_vance',
      password: aliceHashedPassword,
      role: 'USER',
      status: 'ACTIVE',
      balance: { USD: 5000, JPY: 100000, EUR: 4000 },
      failedLoginAttempts: 0,
    });
    this.users.set('bob_id', {
      id: 'bob_id',
      email: 'bob@example.com',
      emailEncrypted: encrypt('bob@example.com'),
      username: 'bob_vance',
      password: bobHashedPassword,
      role: 'USER',
      status: 'ACTIVE',
      balance: { USD: 1500, JPY: 50000, EUR: 1200 },
      failedLoginAttempts: 0,
    });

    // Admin account — seeded only, role ADMIN cannot be set via signup API
    this.users.set('admin_id', {
      id: 'admin_id',
      email: 'admin@securefin.com',
      emailEncrypted: encrypt('admin@securefin.com'),
      username: 'securefin_admin',
      password: adminHashedPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
      balance: { USD: 0, JPY: 0, EUR: 0 },
      failedLoginAttempts: 0,
    });
  }

  /** Publicly expose encrypt/decrypt so auth.service can use them */
  encrypt(plaintext: string): string { return encrypt(plaintext); }
  decrypt(ciphertext: string): string { return decrypt(ciphertext); }

  getUserByEmail(email: string): User | undefined {
    for (const user of this.users.values()) {
      if (user.email === email) return user;
    }
    return undefined;
  }

  getUserByUsername(username: string): User | undefined {
    for (const user of this.users.values()) {
      if (user.username === username) return user;
    }
    return undefined;
  }

  /** Find a user by their ID, email, or username */
  findUser(identifier: string): User | undefined {
    // Try direct ID lookup first (most common)
    if (this.users.has(identifier)) return this.users.get(identifier);
    // Then try email and username
    return this.getUserByEmail(identifier) || this.getUserByUsername(identifier);
  }

  createUser(email: string, username: string, hashedPassword: string, hashedPin?: string): User {
    const id = uuidv4();
    const newUser: User = {
      id,
      email,
      emailEncrypted: encrypt(email), // Security: Store encrypted copy at rest
      username,
      password: hashedPassword,
      transactionPin: hashedPin,
      role: 'USER',
      status: 'ACTIVE',
      balance: { USD: 10000, JPY: 100000, EUR: 10000 },
      failedLoginAttempts: 0,
    };
    this.users.set(id, newUser);
    return newUser;
  }

  updateUser(id: string, updates: Partial<Pick<User, 'email' | 'username' | 'password' | 'profilePicture' | 'transactionPin'>>): User | undefined {
    const user = this.users.get(id);
    if (!user) return undefined;
    // If email is being updated, re-encrypt it
    if (updates.email) updates = { ...updates, emailEncrypted: encrypt(updates.email) } as any;
    Object.assign(user, updates);
    return user;
  }

  /** Admin: Get all users (without passwords) */
  getAllUsers(): Omit<User, 'password'>[] {
    return Array.from(this.users.values()).map(({ password, ...rest }) => rest);
  }

  /** Admin: Update a user's status (ACTIVE / BANNED / LIMITED) */
  updateUserStatus(userId: string, status: 'ACTIVE' | 'BANNED' | 'LIMITED'): User | undefined {
    const user = this.users.get(userId);
    if (!user) return undefined;
    user.status = status;
    return user;
  }

  /** Admin: Get all payments across all users */
  getAllTransactions(): Payment[] {
    return Array.from(this.payments.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }
}
