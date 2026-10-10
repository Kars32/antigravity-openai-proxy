import { NextRequest, NextResponse } from 'next/server';
import { SUPPORTED_MODELS } from '@/lib/models';
import { OPENCODE_MODELS } from '@/lib/opencode';
import { checkAuth, handleOptions } from '@/lib/completions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return handleOptions();
}

// Pre-compute the static model catalog response data at module load time.
// Eliminates per-request O(N * M) nested array searches and array object re-allocations.
const OPENCODE_MODEL_IDS = new Set(OPENCODE_MODELS.map(om => om.id));

const MODEL_LIST_DATA = SUPPORTED_MODELS.map(m => ({
  id: m.id,
  object: 'model',
  created: 1700000000,
  owned_by: OPENCODE_MODEL_IDS.has(m.id) ? 'opencode' : 'google-antigravity',
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
    { object: 'list', data: MODEL_LIST_DATA },
    { headers: { 'Access-Control-Allow-Origin': '*' } }
  );
}
