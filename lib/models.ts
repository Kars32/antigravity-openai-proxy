export interface ModelSpec {
  id: string;
  name: string;
  wireModel: string;
  defaultThinkingBudget: number;
  description: string;
  tier: string;
  speed: string;
  contextWindow: number;
}

import { OPENCODE_MODELS, resolveOpenCodeModel } from './opencode';

export const GOOGLE_SUPPORTED_MODELS: ModelSpec[] = [
  // 0. Image Generation (Native Multimodal Image Wire Model)
  {
    id: "gemini-3.1-flash-image",
    name: "Gemini 3.1 Flash Image (Nano Banana 2)",
    wireModel: "gemini-3.1-flash-image",
    defaultThinkingBudget: 0,
    description: "Google's native high-resolution image generation model.",
    tier: "Image",
    speed: "Fast",
    contextWindow: 4096,
  },

  // 1. Gemini 3.8 Flash Series (Next-Gen Flagship)
  {
    id: "gemini-3.8-flash",
    name: "Gemini 3.8 Flash",
    wireModel: "gemini-3.8-flash-tiered",
    defaultThinkingBudget: 8192,
    description: "Standard Gemini 3.8 Flash flagship model with native audio, video, image, and document understanding.",
    tier: "Standard",
    speed: "Fast",
    contextWindow: 1048576,
  },
  {
    id: "gemini-3.8-flash-high",
    name: "Gemini 3.8 Flash (High)",
    wireModel: "gemini-3.8-flash-tiered",
    defaultThinkingBudget: 24576,
    description: "Google's next-gen flagship hybrid reasoning model with high thinking budget and native audio, video, image, and document understanding.",
    tier: "High",
    speed: "Fast",
    contextWindow: 1048576,
  },
  {
    id: "gemini-3.8-flash-max",
    name: "Gemini 3.8 Flash (Max)",
    wireModel: "gemini-3.8-flash-tiered",
    defaultThinkingBudget: 65535,
    description: "Maximum reasoning budget (64K tokens) for deep architectural planning with native audio, video, image, and document understanding.",
    tier: "Max",
    speed: "Deep",
    contextWindow: 1048576,
  },
  {
    id: "gemini-3.8-flash-medium",
    name: "Gemini 3.8 Flash (Medium)",
    wireModel: "gemini-3.8-flash-tiered",
    defaultThinkingBudget: 8192,
    description: "Balanced multimodal (audio, video, image, document) and coding reasoning on Gemini 3.8.",
    tier: "Medium",
    speed: "Fast",
    contextWindow: 1048576,
  },
  {
    id: "gemini-3.8-flash-low",
    name: "Gemini 3.8 Flash (Low)",
    wireModel: "gemini-3.8-flash-tiered",
    defaultThinkingBudget: 2048,
    description: "Snappy conversational reasoning tier with native audio, video, image, and document understanding.",
    tier: "Low",
    speed: "Fast",
    contextWindow: 1048576,
  },
  {
    id: "gemini-3.8-flash-fast",
    name: "Gemini 3.8 Flash (Fast)",
    wireModel: "gemini-3.8-flash-tiered",
    defaultThinkingBudget: 0,
    description: "Zero-thinking ultra-low latency generation with native audio, video, image, and document understanding.",
    tier: "Fast",
    speed: "Ultra-Fast",
    contextWindow: 1048576,
  },

  // 2. Native Google Search Grounding Models
  {
    id: "gemini-3.8-flash-search",
    name: "Gemini 3.8 Flash (Search)",
    wireModel: "gemini-3.8-flash-tiered",
    defaultThinkingBudget: 8192,
    description: "Gemini 3.8 Flash flagship model with native Google Search grounding, audio, video, image, and document understanding.",
    tier: "Search",
    speed: "Fast",
    contextWindow: 1048576,
  },
  {
    id: "gemini-3.8-flash-high-search",
    name: "Gemini 3.8 Flash High (Search)",
    wireModel: "gemini-3.8-flash-tiered",
    defaultThinkingBudget: 24576,
    description: "Gemini 3.8 Flash High reasoning model with native Google Search grounding, audio, video, image, and document understanding.",
    tier: "Search",
    speed: "Fast",
    contextWindow: 1048576,
  },

  // 3. Anthropic Claude Series
  {
    id: "claude-sonnet-4-6",
    name: "Claude Sonnet 4.6 (Thinking)",
    wireModel: "claude-sonnet-4-6",
    defaultThinkingBudget: 16384,
    description: "High-performance Anthropic model for coding, analysis, and architecture.",
    tier: "Thinking",
    speed: "Adaptive",
    contextWindow: 1048576,
  },
  {
    id: "claude-opus-4-6-thinking",
    name: "Claude Opus 4.6 (Thinking)",
    wireModel: "claude-opus-4-6-thinking",
    defaultThinkingBudget: 16384,
    description: "Anthropic's flagship deep reasoning engine.",
    tier: "Thinking",
    speed: "Deep",
    contextWindow: 1048576,
  },
  {
    id: "opus-4.6-search",
    name: "Claude Opus 4.6 (Search)",
    wireModel: "claude-opus-4-6-thinking",
    defaultThinkingBudget: 6500,
    description: "Claude Opus 4.6 flagship reasoning model with native Google Search grounding and 6.5K thinking budget.",
    tier: "Search",
    speed: "Deep",
    contextWindow: 1048576,
  },

  // 4. Dedicated Cohort Models (Gemini 4 Argon & Claude 5.5)
  {
    id: "gemini-4-argon",
    name: "Gemini 4 Argon (Experimental Flagship)",
    wireModel: "gemini-3.8-flash-high",
    defaultThinkingBudget: 16384,
    description: "Google's next-generation Gemini 4 Argon preview model with deep reasoning and native multimodality.",
    tier: "Argon / Gemini 4",
    speed: "Deep",
    contextWindow: 1048576,
  },
  {
    id: "gemini-4-argon-low",
    name: "Gemini 4 Argon (Low)",
    wireModel: "gemini-3.8-flash-low",
    defaultThinkingBudget: 2048,
    description: "Google's next-generation Gemini 4 Argon preview model with snappy 2K reasoning budget.",
    tier: "Argon / Gemini 4",
    speed: "Snappy",
    contextWindow: 1048576,
  },
  {
    id: "claude-opus-5-5",
    name: "Claude Opus 5.5 (Thinking)",
    wireModel: "claude-opus-5-5-high",
    defaultThinkingBudget: 16384,
    description: "Anthropic's flagship Claude Opus 5.5 deep reasoning model.",
    tier: "Claude 5.5",
    speed: "Deep",
    contextWindow: 1048576,
  },
  {
    id: "claude-opus-5-5-low",
    name: "Claude Opus 5.5 (Low)",
    wireModel: "claude-opus-5-5-low",
    defaultThinkingBudget: 2048,
    description: "Anthropic's flagship Claude Opus 5.5 deep reasoning model with snappy 2K reasoning budget.",
    tier: "Claude 5.5",
    speed: "Snappy",
    contextWindow: 1048576,
  },
  {
    id: "claude-sonnet-5-5",
    name: "Claude Sonnet 5.5 (Thinking)",
    wireModel: "claude-sonnet-5-5-high",
    defaultThinkingBudget: 16384,
    description: "Anthropic's ultra-capable Claude Sonnet 5.5 model for high-speed coding and roleplay.",
    tier: "Claude 5.5",
    speed: "Fast",
    contextWindow: 1048576,
  },
  {
    id: "claude-sonnet-5-5-low",
    name: "Claude Sonnet 5.5 (Low)",
    wireModel: "claude-sonnet-5-5-low",
    defaultThinkingBudget: 2048,
    description: "Anthropic's ultra-capable Claude Sonnet 5.5 model with snappy 2K reasoning budget.",
    tier: "Claude 5.5",
    speed: "Snappy",
    contextWindow: 1048576,
  },
];

export const OPENCODE_MODEL_SPECS: ModelSpec[] = OPENCODE_MODELS.map((m) => ({
  id: m.id,
  name: m.name,
  wireModel: m.wireModel,
  defaultThinkingBudget: m.defaultThinkingBudget,
  description: m.description,
  tier: m.tier,
  speed: m.speed,
  contextWindow: m.contextWindow,
}));

export const SUPPORTED_MODELS: ModelSpec[] = [...GOOGLE_SUPPORTED_MODELS, ...OPENCODE_MODEL_SPECS];

export function resolveModel(modelId: string): { wireModel: string; defaultThinkingBudget: number; isWebSearch?: boolean; targetAccount?: string; isDedicatedCohort?: boolean } | null {
  if (!modelId) return null;
  let clean = modelId.trim().toLowerCase();

  // Normalize common client prefix typos (e.g. gemin- -> gemini-)
  if (clean.startsWith('gemin-')) {
    clean = 'gemini-' + clean.slice(6);
  }

  // Strip redundant multimodal suffixes: Gemini 3.8 models natively understand audio, video, image,
  // and documents within the unified model without requiring separate fragmented endpoints.
  for (const suffix of ['-vision', ':vision', '-multimodal', ':multimodal', '-omni', ':omni', '-audio', ':audio', '-video', ':video']) {
    if (clean.endsWith(suffix)) {
      clean = clean.slice(0, -suffix.length);
      break;
    }
  }

  // Search suffix detection (:search, -search, :web, -web)
  let isWebSearch = false;
  let baseClean = clean;
  if (baseClean.endsWith(':search')) {
    isWebSearch = true;
    baseClean = baseClean.slice(0, -7);
  } else if (baseClean.endsWith('-search')) {
    isWebSearch = true;
    baseClean = baseClean.slice(0, -7);
  } else if (baseClean.endsWith(':web')) {
    isWebSearch = true;
    baseClean = baseClean.slice(0, -4);
  } else if (baseClean.endsWith('-web')) {
    isWebSearch = true;
    baseClean = baseClean.slice(0, -4);
  }

  // Strip multimodal suffixes from baseClean as well (handles patterns like gemini-3.8-flash-vision-search)
  for (const suffix of ['-vision', ':vision', '-multimodal', ':multimodal', '-omni', ':omni', '-audio', ':audio', '-video', ':video']) {
    if (baseClean.endsWith(suffix)) {
      baseClean = baseClean.slice(0, -suffix.length);
      break;
    }
  }

  // Exact ID match against clean SUPPORTED_MODELS
  const exact = SUPPORTED_MODELS.find(m => m.id === clean);
  if (exact) {
    const isSearchModel = clean.endsWith('-search') || clean.endsWith('-web') || isWebSearch;
    const isDedicated = exact.id.startsWith('gemini-4') || exact.id.startsWith('argon') || exact.id.includes('opus-5-5') || exact.id.includes('opus-5.5') || exact.id.includes('sonnet-5-5') || exact.id.includes('sonnet-5.5');
    return {
      wireModel: exact.wireModel,
      defaultThinkingBudget: exact.defaultThinkingBudget,
      isWebSearch: isSearchModel ? true : undefined,
      isDedicatedCohort: isDedicated ? true : undefined,
    };
  }

  // If search suffix was stripped, resolve the base model with isWebSearch: true
  if (isWebSearch && baseClean) {
    const baseResolved = resolveModel(baseClean);
    if (baseResolved) {
      return {
        ...baseResolved,
        isWebSearch: true,
      };
    }
  }

  // Gemini 3.8 Flash variants (high, max, medium/mid, low, fast/off)
  if (clean === 'gemini-3.8-flash-max' || clean === 'gemini-3.8-flash:max' || clean === 'gemini-3.8-flash-xhigh') {
    return { wireModel: 'gemini-3.8-flash-tiered', defaultThinkingBudget: 65535 };
  }
  if (clean === 'gemini-3.8-flash-high' || clean === 'gemini-3.8-flash:high') {
    return { wireModel: 'gemini-3.8-flash-tiered', defaultThinkingBudget: 24576 };
  }
  if (clean === 'gemini-3.8-flash-medium' || clean === 'gemini-3.8-flash-mid' || clean === 'gemini-3.8-flash:medium' || clean === 'gemini-3.8-flash:mid' || clean === 'gemini-3.8-flash' || clean === 'gemini-3.8-flash-tiered') {
    return { wireModel: 'gemini-3.8-flash-tiered', defaultThinkingBudget: 8192 };
  }
  if (clean === 'gemini-3.8-flash-low' || clean === 'gemini-3.8-flash:low') {
    return { wireModel: 'gemini-3.8-flash-tiered', defaultThinkingBudget: 2048 };
  }
  if (clean === 'gemini-3.8-flash-fast' || clean === 'gemini-3.8-flash:fast' || clean === 'gemini-3.8-flash-off' || clean === 'gemini-3.8-flash:off') {
    return { wireModel: 'gemini-3.8-flash-tiered', defaultThinkingBudget: 0 };
  }

  // --- Transparent Legacy & Compatibility Aliases ---

  // Gemini 3.7 / 3.6 Flash legacy aliases -> transparently route to Gemini 3.8 Flash tiers
  if (clean === 'gemini-3.7-flash-max' || clean === 'gemini-3.7-flash:max' || clean === 'gemini-3.7-flash-xhigh') {
    return { wireModel: 'gemini-3.8-flash-tiered', defaultThinkingBudget: 65535 };
  }
  if (clean === 'gemini-3.7-flash-high' || clean === 'gemini-3.7-flash:high' || clean === 'gemini-3.6-flash-high' || clean === 'gemini-3.6-flash:high') {
    return { wireModel: 'gemini-3.8-flash-tiered', defaultThinkingBudget: 24576 };
  }
  if (
    clean === 'gemini-3.7-flash-medium' || clean === 'gemini-3.7-flash-mid' || clean === 'gemini-3.7-flash:medium' || clean === 'gemini-3.7-flash:mid' ||
    clean === 'gemini-3.7-flash' || clean === 'gemini-3.7-flash-tiered' ||
    clean === 'gemini-3.6-flash' || clean === 'gemini-3.6-flash-medium' || clean === 'gemini-3.6-flash:medium' || clean === 'gemini-3.6-flash:mid'
  ) {
    return { wireModel: 'gemini-3.8-flash-tiered', defaultThinkingBudget: 8192 };
  }
  if (clean === 'gemini-3.7-flash-low' || clean === 'gemini-3.7-flash:low' || clean === 'gemini-3.6-flash-low' || clean === 'gemini-3.6-flash:low') {
    return { wireModel: 'gemini-3.8-flash-tiered', defaultThinkingBudget: 2048 };
  }
  if (clean === 'gemini-3.7-flash-fast' || clean === 'gemini-3.7-flash:fast' || clean === 'gemini-3.7-flash-off' || clean === 'gemini-3.7-flash:off') {
    return { wireModel: 'gemini-3.8-flash-tiered', defaultThinkingBudget: 0 };
  }

  // Gemini 3.1 Pro variants -> route to 3.8 Flash High
  if (clean === 'gemini-3.1-pro-low' || clean === 'gemini-3.1-pro:low') {
    return { wireModel: 'gemini-3.8-flash-tiered', defaultThinkingBudget: 2048 };
  }
  if (clean === 'gemini-3.1-pro' || clean === 'gemini-pro-agent' || clean === 'gemini-pro') {
    return { wireModel: 'gemini-3.8-flash-tiered', defaultThinkingBudget: 24576 };
  }

  // Fast flash models -> route to 3.8 Flash Fast (0 thinking)
  if (clean === 'gemini-3.5-flash' || clean === 'gemini-3-flash-agent' || clean === 'gemini-2.5-flash') {
    return { wireModel: 'gemini-3.8-flash-tiered', defaultThinkingBudget: 0 };
  }

  // Image models
  if (clean === 'gemini-3.1-flash-image') {
    return { wireModel: 'gemini-3.1-flash-image', defaultThinkingBudget: 0 };
  }

  // Claude models & aliases
  if (
    clean === 'opus-4.6-search' ||
    clean === 'opus-4.6:search' ||
    clean === 'opus-4-6-search' ||
    clean === 'claude-opus-4-6-search' ||
    clean === 'claude-opus-4.6-search' ||
    clean === 'claude-opus-4-6:search' ||
    clean === 'opus-4.6-web' ||
    clean === 'opus-4.6:web' ||
    clean === 'opus-4-6-web' ||
    clean === 'claude-opus-4-6-web' ||
    clean === 'claude-opus-4.6-web' ||
    clean === 'claude-opus-4-6:web'
  ) {
    return { wireModel: 'claude-opus-4-6-thinking', defaultThinkingBudget: 6500, isWebSearch: true };
  }
  if (clean === 'claude-sonnet-4-6' || clean === 'claude-sonnet-4.6' || clean === 'claude-3-7-sonnet' || clean === 'claude-3-5-sonnet' || clean === 'claude-sonnet') {
    return { wireModel: 'claude-sonnet-4-6', defaultThinkingBudget: 16384 };
  }
  if (clean === 'claude-opus-4-6-thinking' || clean === 'claude-opus-4-6' || clean === 'claude-opus-4.6' || clean === 'claude-opus' || clean === 'opus-4.6' || clean === 'opus-4-6') {
    return { wireModel: 'claude-opus-4-6-thinking', defaultThinkingBudget: 16384 };
  }

  // Dedicated Cohort Models (Argon & Claude 5.5)
  if (
    clean === 'gemini-4-argon' ||
    clean === 'gemini-4' ||
    clean === 'argon' ||
    clean === 'argon-tiered' ||
    clean === 'argon-high' ||
    clean === 'argon-max' ||
    clean === 'argon-medium' ||
    clean === 'argon-low' ||
    clean === 'argon-fast' ||
    clean === 'gemini-4-argon-low' ||
    clean === 'gemini-4-argon-fast' ||
    clean === 'gemini-4-argon-high' ||
    clean === 'gemini-4-argon-max' ||
    clean === 'gemini-4-low' ||
    clean === 'gemini-4-fast'
  ) {
    const isLow = clean.includes('low') || clean === 'gemini-4-argon-low' || clean === 'argon-low' || clean === 'gemini-4-low';
    const isFast = clean.includes('fast');
    const isMax = clean.includes('max');
    const budget = isFast ? 0 : isLow ? 2048 : isMax ? 65535 : (clean.includes('high') ? 24576 : 16384);
    const wireModel = (isLow || isFast) ? 'gemini-3.8-flash-low' : 'gemini-3.8-flash-high';
    return { wireModel, defaultThinkingBudget: budget, targetAccount: 'acc-8', isDedicatedCohort: true };
  }
  if (
    clean === 'claude-opus-5-5' ||
    clean === 'claude-opus-5.5' ||
    clean === 'opus-5.5' ||
    clean === 'opus-5-5' ||
    clean === 'claude-opus-5-5-thinking' ||
    clean === 'opus-5.5-thinking' ||
    clean === 'claude-opus-5-5-low' ||
    clean === 'claude-opus-5.5-low' ||
    clean === 'opus-5.5-low' ||
    clean === 'opus-5-5-low' ||
    clean === 'claude-opus-5-5-fast' ||
    clean === 'opus-5.5-fast'
  ) {
    const isLow = clean.includes('low');
    const isFast = clean.includes('fast');
    const budget = isFast ? 0 : isLow ? 2048 : 16384;
    const wireModel = isLow ? 'claude-opus-5-5-low' : (isFast ? 'claude-opus-5-5-low' : 'claude-opus-5-5-high');
    return { wireModel, defaultThinkingBudget: budget, targetAccount: 'acc-8', isDedicatedCohort: true };
  }
  if (
    clean === 'claude-sonnet-5-5' ||
    clean === 'claude-sonnet-5.5' ||
    clean === 'sonnet-5.5' ||
    clean === 'sonnet-5-5' ||
    clean === 'claude-sonnet-5-5-thinking' ||
    clean === 'sonnet-5.5-thinking' ||
    clean === 'claude-sonnet-5-5-low' ||
    clean === 'claude-sonnet-5.5-low' ||
    clean === 'sonnet-5.5-low' ||
    clean === 'sonnet-5-5-low' ||
    clean === 'claude-sonnet-5-5-fast' ||
    clean === 'sonnet-5.5-fast'
  ) {
    const isLow = clean.includes('low');
    const isFast = clean.includes('fast');
    const budget = isFast ? 0 : isLow ? 2048 : 16384;
    const wireModel = isLow ? 'claude-sonnet-5-5-low' : (isFast ? 'claude-sonnet-5-5-low' : 'claude-sonnet-5-5-high');
    return { wireModel, defaultThinkingBudget: budget, targetAccount: 'acc-8', isDedicatedCohort: true };
  }

  // OpenAI aliases -> transparently route to Gemini 3.8 Flash tiers
  if (clean === 'gpt-4o' || clean === 'gpt-4' || clean === 'gpt-3.5-turbo') {
    return { wireModel: 'gemini-3.8-flash-tiered', defaultThinkingBudget: 8192 };
  }
  if (clean === 'gpt-4o-mini') {
    return { wireModel: 'gemini-3.8-flash-tiered', defaultThinkingBudget: 2048 };
  }

  // OpenCode models resolution (including active models, -fast variants, and deprecated aliases like mimo-v2.5-free)
  const openCodeResolved = resolveOpenCodeModel(clean);
  if (openCodeResolved) {
    return {
      wireModel: openCodeResolved.wireModel,
      defaultThinkingBudget: openCodeResolved.isFast ? 0 : 8192,
    };
  }

  // Google internal wire format pass-through
  if (clean.startsWith('publishers/google/models/') || clean.startsWith('models/')) {
    return { wireModel: clean, defaultThinkingBudget: 8192 };
  }

  return null;
}
