import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  try {
    const body = await req.json();
    const res = await fetch(`${backendUrl}/auth/signup`, {
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
      // Surface validation errors from class-validator
      const message =
        typeof data === 'object'
          ? (Array.isArray(data?.message) ? data.message.join('. ') : data?.message)
          : data;
      return NextResponse.json(
        { success: false, error: { code: data?.error || 'SIGNUP_FAILED', message: message || 'Signup failed' } },
        { status: res.status }
      );
    }

    // Security: Set the JWT in an HttpOnly cookie on successful signup
    const accessToken = data?.accessToken;
    if (accessToken) {
      const cookieStore = await cookies();
      cookieStore.set('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600,
        path: '/',
      });
    }

    const { accessToken: _stripped, ...safeData } = data;
    return NextResponse.json({ success: true, data: { user: safeData.user ?? safeData } }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'BFF_ERROR', message: error.message } },
      { status: 502 }
    );
  }
}
