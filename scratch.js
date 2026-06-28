const crypto = require('crypto');

function sortObjectKeys(obj) {
  if (typeof obj !== 'object' || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(sortObjectKeys);
  return Object.keys(obj)
    .sort()
    .reduce((result, key) => {
      result[key] = sortObjectKeys(obj[key]);
      return result;
    }, {});
}

const bodyStr = '{"senderId":"user_123","recipientId":"user_456","amount":"100.00","currency":"JPY","description":"Payment"}';
const body = JSON.parse(bodyStr);

const secret = 'proto_payment_secret_2026_super_secure';

const signature = crypto.createHmac('sha256', secret).update(JSON.stringify(sortObjectKeys(body))).digest('hex');
console.log('Signature:', signature);
