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
    const paginatedLogs = logs.slice(startIndex, endIndex).map((log, i) => ({
      ...log,
      index: startIndex + i,
    }));

    return {
      logs: paginatedLogs,
      pagination: { total, page, limit },
    };
  }

  // Verifies the entire hash chain — detects any tampered log entries
  verifyLedger(): { verified: boolean; tamperedIndex?: number } {
    const logs = this.db.auditLogs;
    for (let i = 0; i < logs.length; i++) {
      const log = logs[i];
      const expectedPrev = i === 0 ? 'GENESIS' : logs[i - 1].checksum;
      if (log.prevChecksum !== expectedPrev) {
        return { verified: false, tamperedIndex: i };
      }
      // Re-compute this log's hash and check it matches stored checksum
      const payloadToHash = `${log.logId}${log.paymentId}${log.event}${log.actor}${log.timestamp}${log.prevChecksum}`;
      const expectedChecksum = crypto
        .createHash('sha256')
        .update(payloadToHash)
        .digest('hex');
      if (log.checksum !== expectedChecksum) {
        return { verified: false, tamperedIndex: i };
      }
    }
    return { verified: true };
  }

  // Simulates a database attack by mutating a log entry without updating the hash chain
  tamperLog(
    index: number,
    amount: string,
  ): { tampered: boolean; index: number } {
    const logs = this.db.auditLogs;
    if (index < 0 || index >= logs.length) {
      throw new Error(
        `Log index ${index} is out of range (0–${logs.length - 1})`,
      );
    }
    // Silently mutate the log entry — hash chain will now be broken at this index
    logs[index] = {
      ...logs[index],
      paymentId: `TAMPERED-${logs[index].paymentId}-AMOUNT-${amount}`,
    };
    return { tampered: true, index };
  }
}
