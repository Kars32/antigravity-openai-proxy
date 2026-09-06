import { NextRequest, NextResponse } from 'next/server';
import { getAccounts } from '@/lib/antigravity';
import { SUPPORTED_MODELS } from '@/lib/models';
import { getOpenCodeAccounts } from '@/lib/opencode';
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

  const accounts = getAccounts();
  const openCodeAccounts = getOpenCodeAccounts();
  const now = Date.now();

  return NextResponse.json(
    {
      status: 'online',
      gateway: 'antigravity-openai-proxy',
      version: '1.1.0',
      accounts: accounts.map(a => ({
        id: a.id,
        name: a.name,
        projectId: a.projectId,
        isCoolingDown: a.cooldownUntil > now,
        cooldownRemainingSec: Math.max(0, Math.ceil((a.cooldownUntil - now) / 1000)),
        failCount: a.failCount,
      })),
      opencodeAccounts: openCodeAccounts.map(a => ({
        id: a.id,
        name: a.name,
        isCoolingDown: a.cooldownUntil > now,
        cooldownRemainingSec: Math.max(0, Math.ceil((a.cooldownUntil - now) / 1000)),
        failCount: a.failCount,
        successCount: a.successCount,
      })),
      totalOpenCodeAccounts: openCodeAccounts.length,
      modelsCount: SUPPORTED_MODELS.length,
      timestamp: new Date().toISOString(),
    },
    { headers: { 'Access-Control-Allow-Origin': '*' } }
  );
}
