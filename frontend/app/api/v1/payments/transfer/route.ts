import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { calculateHmac } from '@/app/utils/crypto';

export async function POST(req: Request) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
  const secret = process.env.PAYMENT_SIGNING_SECRET || 'proto_payment_secret_2026_super_secure';

  // Security: Read the JWT from the HttpOnly cookie — never from client-supplied headers
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value || '';

  try {
    const idempotencyKey = req.headers.get('x-idempotency-key') || '';
    const simulateTamper = req.headers.get('x-simulate-tamper') === 'true';
    const simulateBadSignature = req.headers.get('x-simulate-bad-signature') === 'true';

    const body = await req.json();

    // 1. Calculate the signature based on the original payload body
    let signature = calculateHmac(body, secret);

    // 2. Prepare payload to send to backend
    const payloadToSend = { ...body };

    // MITM Tamper Simulation:
    // Sign the original body, but modify the payload amount sent to backend.
    if (simulateTamper) {
      const numericAmount = parseFloat(body.amount) || 0;
      payloadToSend.amount = (numericAmount * 10).toFixed(2); // Manipulate amount
    }

    // Bad Signature Simulation:
    // Send a garbled hash signature.
    if (simulateBadSignature) {
      signature = 'bad_sig_0000000000000000000000000000000000000000000000000000000000000000';
    }

    // 3. Dispatch request to backend — token comes from the secure HttpOnly cookie
    const res = await fetch(`${backendUrl}/payments/transfer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Idempotency-Key': idempotencyKey,
        'X-Signature': signature,
      },
      body: JSON.stringify(payloadToSend),
      cache: 'no-store',
    });

    const contentType = res.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await res.json() : await res.text();

    if (!res.ok) {
      return NextResponse.json(
        typeof data === 'object' ? data : { success: false, error: { code: 'BACKEND_ERROR', message: data } },
        { status: res.status }
      );
    }
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'BFF_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}
