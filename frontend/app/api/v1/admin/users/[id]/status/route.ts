import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

/** PATCH /api/v1/admin/users/[id]/status — update a user's account status */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated.' } },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();

    const res = await fetch(`${BACKEND}/admin/users/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: { code: data?.error || 'UPDATE_FAILED', message: data?.message || 'Status update failed.' } },
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
