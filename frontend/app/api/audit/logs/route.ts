import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
  const { searchParams } = new URL(req.url);
  const authHeader = req.headers.get('authorization') || '';

  try {
    const res = await fetch(`${backendUrl}/audit/logs?${searchParams.toString()}`, {
      headers: {
        'Authorization': authHeader,
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
