import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (process.env.API_KEY) {
      headers['X-API-Key'] = process.env.API_KEY;
    }
    
    const response = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + '/generate-report', {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : 'An unknown error occurred' }, 
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { detail: 'Method not allowed' }, 
    { status: 405 }
  );
}