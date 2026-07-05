import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Security: True session invalidation — calls the backend to blocklist the JWT,
// then deletes the HttpOnly cookie from the browser.
export async function POST() {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  // Attempt to blocklist the JWT on the backend
  if (token) {
    try {
      await fetch(`${backendUrl}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
    } catch {
      // Best-effort: even if the backend is unreachable, still clear cookies
    }
  }

  // Always delete both session cookies
  cookieStore.delete('accessToken');
  cookieStore.delete('csrfToken');
  return NextResponse.json({ success: true });
}
