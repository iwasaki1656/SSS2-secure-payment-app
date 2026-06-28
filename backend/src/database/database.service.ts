import { Injectable, OnModuleInit } from '@nestjs/common';
import { User, Payment, AuditLog } from './models';
import * as bcrypt from 'bcrypt';

@Injectable()
export class DatabaseService implements OnModuleInit {
  public users: Map<string, User> = new Map();
  public payments: Map<string, Payment> = new Map();
  public auditLogs: AuditLog[] = [];

  onModuleInit() {
    // Security: Passwords are hashed using bcrypt (salt rounds=10) — never stored in plaintext
    const aliceHashedPassword = bcrypt.hashSync('vW8#xK9$mP2!qL5', 10);
    const bobHashedPassword = bcrypt.hashSync('rT4@nZ7&jQ1^cX3', 10);

    // Seed initial users
    this.users.set('alice_id', {
      id: 'alice_id',
      email: 'alice@example.com',
      password: aliceHashedPassword,
      role: 'USER',
      balance: 1000,
    });
    this.users.set('bob_id', {
      id: 'bob_id',
      email: 'bob@example.com',
      password: bobHashedPassword,
      role: 'USER',
      balance: 500,
    });
  }

  getUserByEmail(email: string): User | undefined {
    for (const user of this.users.values()) {
      if (user.email === email) return user;
    }
    return undefined;
  }
}

