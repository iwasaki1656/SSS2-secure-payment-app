import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AuditLog } from '../database/models';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

@Injectable()
export class AuditService {
  constructor(private readonly db: DatabaseService) {}

  appendLog(paymentId: string, event: string, actor: string): AuditLog {
    const timestamp = new Date().toISOString();
    const prevLog =
      this.db.auditLogs.length > 0
        ? this.db.auditLogs[this.db.auditLogs.length - 1]
        : null;
    const prevChecksum = prevLog ? prevLog.checksum : 'GENESIS';

    const logId = uuidv4();
    const payloadToHash = `${logId}${paymentId}${event}${actor}${timestamp}${prevChecksum}`;
    const checksum = crypto
      .createHash('sha256')
      .update(payloadToHash)
      .digest('hex');

    const newLog: AuditLog = {
      logId,
      paymentId,
      event,
      actor,
      timestamp,
      checksum,
      prevChecksum,
    };

    this.db.auditLogs.push(newLog);
    return newLog;
  }

  getLogs(page: number = 1, limit: number = 10, paymentId?: string) {
    let logs = this.db.auditLogs;
    if (paymentId) {
      logs = logs.filter((log) => log.paymentId === paymentId);
    }

    const total = logs.length;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedLogs = logs.slice(startIndex, endIndex);

    return {
      logs: paginatedLogs,
      pagination: {
        total,
        page,
        limit,
      },
    };
  }
}
