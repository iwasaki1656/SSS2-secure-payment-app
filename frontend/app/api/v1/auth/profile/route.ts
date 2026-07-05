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
    const data = isJson ? await res.json() : await res.text();

    if (!res.ok) {
      const message =
        typeof data === 'object'
          ? (Array.isArray(data?.message) ? data.message.join('. ') : data?.message)
          : data;
      return NextResponse.json(
        { success: false, error: { code: data?.error || 'UPDATE_FAILED', message: message || 'Profile update failed' } },
        { status: res.status }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'BFF_ERROR', message: error.message } },
      { status: 502 }
    );
  }
}
