import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { randomBytes } from 'crypto';

export async function POST(req: Request) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  try {
    const body = await req.json();
    const res = await fetch(`${backendUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const contentType = res.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await res.json() : await res.text();

    if (!res.ok) {
      return NextResponse.json(
        typeof data === 'object' ? data : { success: false, error: { code: 'LOGIN_FAILED', message: data } },
        { status: res.status }
      );
    }

    // Security: Extract the JWT and set it in an HttpOnly, Secure cookie.
    // This prevents client-side JS (XSS attacks) from ever reading the token.
    const accessToken = data?.accessToken || data?.data?.accessToken;
    const cookieStore = await cookies();
    if (accessToken) {
      cookieStore.set('accessToken', accessToken, {
        httpOnly: true,       // Not accessible via document.cookie (XSS protection)
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'strict',   // CSRF protection — only sent for same-site requests
        maxAge: 3600,         // 1 hour — matches JWT expiry
        path: '/',
      });
    }

    // Security: Generate an Anti-CSRF token and set it as a readable (non-HttpOnly) cookie.
    // The client must echo this token back in X-CSRF-Token on state-changing requests.
    // An attacker's site cannot read this cookie (same-origin policy) and therefore
    // cannot forge valid cross-site requests.
    const csrfToken = randomBytes(32).toString('hex');
    cookieStore.set('csrfToken', csrfToken, {
      httpOnly: false,      // Must be readable by JS so the client can attach it to headers
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600,
      path: '/',
    });

    // Strip the raw token from the response body — the client never needs to see it
    const { accessToken: _stripped, ...safeData } = data?.data ? { ...data.data, accessToken: data.data.accessToken } : data;
    return NextResponse.json({ success: true, data: { user: safeData.user ?? safeData, csrfToken } });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'BFF_ERROR', message: error.message } },
      { status: 502 }
    );
  }
}
