import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get('accessToken')?.value;
}

/** GET /api/v1/admin/users — list all users (admin only) */
export async function GET() {
  try {
    const token = await getToken();
    if (!token) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated.' } },
        { status: 401 }
      );
    }

    const res = await fetch(`${BACKEND}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: { code: data?.error || 'FORBIDDEN', message: data?.message || 'Access denied.' } },
        { status: res.status }
      );
    }

    return NextResponse.json({ success: true, data: data.data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'BFF_ERROR', message: error.message } },
      { status: 502 }
    );
  }
}
