const http = require('http');
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

const loginData = JSON.stringify({
  email: 'alice@example.com',
  password: 'password'
});

const req = http.request('http://localhost:3001/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
}, (res) => {
  let chunks = '';
  res.on('data', chunk => chunks += chunk);
  res.on('end', () => {
    const data = JSON.parse(chunks);
    if (!data.success) {
      console.log('Login failed', data);
      return;
    }
    const token = data.data.accessToken;
    const body = {
      senderId: data.data.user.id,
      recipientId: "user_456",
      amount: "100.00",
      currency: "JPY",
      description: "test"
    };
    
    const secret = 'proto_payment_secret_2026_super_secure';
    const sortedBody = sortObjectKeys(body);
    const signature = crypto.createHmac('sha256', secret).update(JSON.stringify(sortedBody)).digest('hex');
    
    const req2 = http.request('http://localhost:3000/api/v1/payments/transfer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Idempotency-Key': Date.now().toString()
      }
    }, (res2) => {
      let chunks2 = '';
      res2.on('data', chunk => chunks2 += chunk);
      res2.on('end', () => console.log('Transfer Response:', chunks2));
    });
    
    req2.write(JSON.stringify(body));
    req2.end();
  });
});

req.write(loginData);
req.end();
