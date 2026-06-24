import { Injectable, OnModuleInit } from '@nestjs/common';
import { User, Payment, AuditLog } from './models';

@Injectable()
export class DatabaseService implements OnModuleInit {
  public users: Map<string, User> = new Map();
  public payments: Map<string, Payment> = new Map();
  public auditLogs: AuditLog[] = [];

  onModuleInit() {
    // Seed initial users
    this.users.set('alice_id', {
      id: 'alice_id',
      email: 'alice@example.com',
      password: 'password',
      role: 'USER',
      balance: 1000,
    });
    this.users.set('bob_id', {
      id: 'bob_id',
      email: 'bob@example.com',
      password: 'password',
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
