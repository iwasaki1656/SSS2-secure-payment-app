import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AdminService {
  constructor(private readonly db: DatabaseService) {}

  /** Get all users (password excluded).
   * Note: Do NOT wrap in { success, data } — the global TransformInterceptor handles that. */
  getAllUsers() {
    const users = this.db.getAllUsers();
    return { users, total: users.length };
  }

  /** Update a user's account status (ACTIVE / BANNED / LIMITED) */
  updateUserStatus(userId: string, status: 'ACTIVE' | 'BANNED' | 'LIMITED') {
    const user = this.db.users.get(userId);
    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'User not found.',
      });
    }

    const updated = this.db.updateUserStatus(userId, status);
    if (!updated) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'User not found.',
      });
    }

    const { password, ...userWithoutPassword } = updated;
    return { user: userWithoutPassword };
  }

  /** Get all transactions across all users.
   * Note: Do NOT wrap in { success, data } — the global TransformInterceptor handles that. */
  getAllTransactions() {
    const transactions = this.db.getAllTransactions();
    return { transactions, total: transactions.length };
  }
}
