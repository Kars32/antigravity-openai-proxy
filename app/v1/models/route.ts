import { NextRequest, NextResponse } from 'next/server';
import { OPENAI_MODELS_LIST } from '@/lib/models';
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

  return NextResponse.json(
    { object: 'list', data: OPENAI_MODELS_LIST },
    { headers: { 'Access-Control-Allow-Origin': '*' } }
  );
}
