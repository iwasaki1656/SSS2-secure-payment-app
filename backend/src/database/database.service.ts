import { Injectable, OnModuleInit } from '@nestjs/common';
import { User, Payment, AuditLog } from './models';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DatabaseService implements OnModuleInit {
  public users: Map<string, User> = new Map();
  public payments: Map<string, Payment> = new Map();
  public auditLogs: AuditLog[] = [];

  onModuleInit() {
    // Security: Passwords are hashed using bcrypt (salt rounds=10) — never stored in plaintext
    const aliceHashedPassword = bcrypt.hashSync('vW8#xK9$mP2!qL5', 10);
    const bobHashedPassword = bcrypt.hashSync('rT4@nZ7&jQ1^cX3', 10);
    // Admin credentials — seeded directly, cannot be created via signup
    const adminHashedPassword = bcrypt.hashSync('Admin@SecureFin2026!', 10);

    // Seed initial users with currency-specific balances matching frontend expectations
    this.users.set('alice_id', {
      id: 'alice_id',
      email: 'alice@example.com',
      username: 'alice_vance',
      password: aliceHashedPassword,
      role: 'USER',
      status: 'ACTIVE',
      balance: { USD: 5000, JPY: 100000, EUR: 4000 },
    });
    this.users.set('bob_id', {
      id: 'bob_id',
      email: 'bob@example.com',
      username: 'bob_vance',
      password: bobHashedPassword,
      role: 'USER',
      status: 'ACTIVE',
      balance: { USD: 1500, JPY: 50000, EUR: 1200 },
    });

    // Admin account — seeded only, role ADMIN cannot be set via signup API
    this.users.set('admin_id', {
      id: 'admin_id',
      email: 'admin@securefin.com',
      username: 'securefin_admin',
      password: adminHashedPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
      balance: { USD: 0, JPY: 0, EUR: 0 },
    });
  }

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

  createUser(email: string, username: string, hashedPassword: string): User {
    const id = uuidv4();
    const newUser: User = {
      id,
      email,
      username,
      password: hashedPassword,
      role: 'USER', // Security: all self-registered users are always USER, never ADMIN
      status: 'ACTIVE',
      // New users start with a generous seed balance
      balance: { USD: 10000, JPY: 100000, EUR: 10000 },
    };
    this.users.set(id, newUser);
    return newUser;
  }

  updateUser(id: string, updates: Partial<Pick<User, 'email' | 'username' | 'password' | 'profilePicture'>>): User | undefined {
    const user = this.users.get(id);
    if (!user) return undefined;
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
