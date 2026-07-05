const http = require('http');
const req = http.request({
  hostname: 'localhost',
  port: 3001,
  path: '/api/v1/auth/signup',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
});
req.write(JSON.stringify({
  email: 'test_balance@example.com',
  username: 'test_balance',
  password: 'Password1234!'
}));
req.end();
