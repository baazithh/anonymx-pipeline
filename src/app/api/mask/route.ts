import { NextRequest, NextResponse } from 'next/server';
import { MaskingEngine } from '@/lib/maskingEngine';

export async function POST(req: NextRequest) {
  try {
    const { payload, config } = await req.json();
    
    const backendRes = await fetch('http://localhost:8000/mask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payload, config })
    });

    if (!backendRes.ok) {
      throw new Error(`Backend responded with ${backendRes.status}`);
    }

    const result = await backendRes.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Masking API error:', error);
    return NextResponse.json({ error: 'Failed to process payload' }, { status: 500 });
  }
}
