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

    // Seed initial users with currency-specific balances matching frontend expectations
    this.users.set('alice_id', {
      id: 'alice_id',
      email: 'alice@example.com',
      username: 'alice_vance',
      password: aliceHashedPassword,
      role: 'USER',
      balance: { USD: 5000, JPY: 100000, EUR: 4000 },
    });
    this.users.set('bob_id', {
      id: 'bob_id',
      email: 'bob@example.com',
      username: 'bob_vance',
      password: bobHashedPassword,
      role: 'USER',
      balance: { USD: 1500, JPY: 50000, EUR: 1200 },
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
      role: 'USER',
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
}
