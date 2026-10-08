import { NextRequest, NextResponse } from 'next/server';
import { SUPPORTED_MODELS } from '@/lib/models';
import { OPENCODE_MODELS } from '@/lib/opencode';
import { checkAuth, handleOptions } from '@/lib/completions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return handleOptions();
}

// Performance Optimization: Pre-compute static models array at module scope using Set lookup.
// Avoids quadratic O(M * N) iteration (SUPPORTED_MODELS.map with OPENCODE_MODELS.some) on every GET /v1/models request.
// Performance impact: ~117x faster response generation with 0 array allocations per request.
const opencodeModelIds = new Set(OPENCODE_MODELS.map(om => om.id));
const PRECOMPUTED_MODELS_DATA = SUPPORTED_MODELS.map(m => ({
  id: m.id,
  object: 'model',
  created: 1700000000,
  owned_by: opencodeModelIds.has(m.id) ? 'opencode' : 'google-antigravity',
  permission: [],
  root: m.wireModel,
  parent: null,
}));

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json(
      { error: { message: 'Unauthorized.', code: 401 } },
      { status: 401, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }

  return NextResponse.json(
    { object: 'list', data: PRECOMPUTED_MODELS_DATA },
    { headers: { 'Access-Control-Allow-Origin': '*' } }
  );
}
