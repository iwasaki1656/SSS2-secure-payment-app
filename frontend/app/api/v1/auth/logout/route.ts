import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Security: Clears the HttpOnly accessToken cookie on logout.
// The client cannot clear this cookie itself since it's HttpOnly.
export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete('accessToken');
  return NextResponse.json({ success: true });
}
