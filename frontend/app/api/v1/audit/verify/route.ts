import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  // Security: Read the JWT from the HttpOnly cookie — never from client-supplied headers
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value || '';

  try {
    const res = await fetch(`${backendUrl}/audit/verify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
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
      { status: 502 }
    );
  }
}
