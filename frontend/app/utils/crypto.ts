import * as crypto from 'crypto';

/**
 * Deterministically sorts object keys recursively to ensure consistent JSON serialization.
 */
export function sortObjectKeys(obj: any): any {
  if (typeof obj !== 'object' || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(sortObjectKeys);
  return Object.keys(obj)
    .sort()
    .reduce((result, key) => {
      result[key] = sortObjectKeys(obj[key]);
      return result;
    }, {} as Record<string, any>);
}

/**
 * Generates an HMAC-SHA256 signature for a request body using a shared secret.
 */
export function calculateHmac(body: Record<string, any>, secret: string): string {
  const sortedBody = sortObjectKeys(body);
  const message = JSON.stringify(sortedBody);
  return crypto.createHmac('sha256', secret).update(message).digest('hex');
}
