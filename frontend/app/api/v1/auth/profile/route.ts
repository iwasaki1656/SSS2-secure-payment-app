import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function PUT(req: Request) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated.' } },
        { status: 401 }
      );
    }

    // Security: CSRF validation — the client must echo back the token from the csrfToken cookie
    const csrfCookie = cookieStore.get('csrfToken')?.value;
    const csrfHeader = req.headers.get('x-csrf-token');
    if (!csrfCookie || csrfCookie !== csrfHeader) {
      return NextResponse.json(
        { success: false, error: { code: 'CSRF_VIOLATION', message: 'Invalid or missing CSRF token. Request blocked.' } },
        { status: 403 }
      );
    }

    const body = await req.json();
    const res = await fetch(`${backendUrl}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const contentType = res.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const rawData = isJson ? await res.json() : await res.text();

    if (!res.ok) {
      // Backend wraps errors via TransformInterceptor — unwrap if needed
      const errPayload = rawData?.data || rawData;
      const message =
        typeof errPayload === 'object'
          ? (Array.isArray(errPayload?.message) ? errPayload.message.join('. ') : errPayload?.message)
          : errPayload;
      return NextResponse.json(
        { success: false, error: { code: errPayload?.error || 'UPDATE_FAILED', message: message || 'Profile update failed' } },
        { status: res.status }
      );
    }

    // Backend response is already wrapped by TransformInterceptor as { success, data: { user } }
    // Unwrap the inner layer so the frontend receives: { success: true, data: { user } }
    const innerData = rawData?.data ?? rawData;
    return NextResponse.json({ success: true, data: innerData });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'BFF_ERROR', message: error.message } },
      { status: 502 }
    );
  }
}
