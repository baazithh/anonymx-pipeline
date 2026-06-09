import { NextRequest, NextResponse } from 'next/server';
import { MaskingEngine } from '@/lib/maskingEngine';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const result = MaskingEngine.processPayload(payload);
    
    // Artificial slight delay to simulate real-world processing
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process payload' }, { status: 500 });
  }
}
