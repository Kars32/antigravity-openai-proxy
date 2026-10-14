import { NextRequest, NextResponse } from 'next/server';
import { PRECOMPUTED_MODELS_DATA } from '@/lib/models';
import { checkAuth, handleOptions } from '@/lib/completions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json(
      { error: { message: 'Unauthorized.', code: 401 } },
      { status: 401, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }

  // Return pre-computed frozen model list data (O(1) response generation)
  return NextResponse.json(
    { object: 'list', data: PRECOMPUTED_MODELS_DATA },
    { headers: { 'Access-Control-Allow-Origin': '*' } }
  );
}
