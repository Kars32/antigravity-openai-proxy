import { NextRequest } from 'next/server';
import { handleChatCompletions, handleOptions } from '@/lib/completions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  return handleChatCompletions(req);
}

export async function OPTIONS() {
  return handleOptions();
}
