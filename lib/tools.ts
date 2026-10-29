export interface OpenAITool {
  type: 'function';
  function: {
    name: string;
    description?: string;
    parameters?: Record<string, any>;
  };
}

export function transformOpenAIToolsToGoogle(tools?: OpenAITool[]): any[] | undefined {
  if (!tools || !Array.isArray(tools) || tools.length === 0) return undefined;

  const functionDeclarations = tools
    .filter(t => t && t.type === 'function' && t.function && t.function.name)
    .map(t => {
      const decl: any = {
        name: t.function.name,
        description: t.function.description || '',
      };
      if (t.function.parameters) {
        decl.parameters = t.function.parameters;
      }
      return decl;
    });

  if (functionDeclarations.length === 0) return undefined;
  return [{ functionDeclarations }];
}

export function formatToolChoice(toolChoice?: any): any {
  if (!toolChoice) return undefined;
  if (typeof toolChoice === 'string') {
    if (toolChoice === 'auto') return { mode: 'AUTO' };
    if (toolChoice === 'none') return { mode: 'NONE' };
    if (toolChoice === 'required') return { mode: 'ANY' };
  }
  if (typeof toolChoice === 'object' && toolChoice.type === 'function' && toolChoice.function?.name) {
    return {
      mode: 'ANY',
      allowedFunctionNames: [toolChoice.function.name],
    };
  }
  return undefined;
}

export interface GroundingCollector {
  webSearchQueries: Set<string>;
  sources: { title: string; url: string }[];
  seenUrls: Set<string>;
}

export function createGroundingCollector(): GroundingCollector {
  return {
    webSearchQueries: new Set<string>(),
    sources: [],
    seenUrls: new Set<string>(),
  };
}

export function isWebSearchRequested(
  body: any,
  modelId?: string,
  resolved?: { isWebSearch?: boolean } | null
): boolean {
  if (resolved?.isWebSearch === true) return true;
  const m = (modelId || body?.model || '').toLowerCase().trim();
  if (
    m.endsWith('-search') ||
    m.endsWith(':search') ||
    m.endsWith('-web') ||
    m.endsWith(':web')
  ) {
    return true;
  }
  if (body?.web_search === true || body?.web_search === 'true' || body?.web_search === 1) return true;
  if (body?.search === true || body?.search === 'true' || body?.search === 1) return true;
  if (body?.grounding === true || body?.grounding === 'true' || body?.grounding === 1) return true;

  if (Array.isArray(body?.tools)) {
    for (const t of body.tools) {
      if (!t) continue;
      const type = (typeof t.type === 'string' ? t.type : '').toLowerCase();
      const fnName = (t.function?.name ? String(t.function.name) : '').toLowerCase();
      if (
        type === 'web_search' ||
        type === 'google_search' ||
        type === 'search' ||
        fnName === 'web_search' ||
        fnName === 'google_search' ||
        fnName === 'search'
      ) {
        return true;
      }
    }
  }

  return false;
}

export function recordGroundingMetadata(metadata: any, target: GroundingCollector): void {
  if (!metadata || typeof metadata !== 'object') return;

  const queries = metadata.webSearchQueries || metadata.web_search_queries || metadata.searchQueries;
  if (Array.isArray(queries)) {
    for (const q of queries) {
      if (typeof q === 'string' && q.trim()) {
        target.webSearchQueries.add(q.trim());
      }
    }
  }

  const chunks = metadata.groundingChunks || metadata.grounding_chunks;
  if (Array.isArray(chunks)) {
    for (const chunk of chunks) {
      if (!chunk) continue;
      const web = chunk.web || chunk;
      const url = typeof web.uri === 'string' ? web.uri : (typeof web.url === 'string' ? web.url : '');
      const rawTitle = typeof web.title === 'string' ? web.title.trim() : '';
      const title = rawTitle || url;
      if (url && !target.seenUrls.has(url)) {
        target.seenUrls.add(url);
        target.sources.push({ title, url });
      }
    }
  }
}

export function formatGroundingMarkdown(grounding: GroundingCollector): string {
  if (grounding.sources.length === 0 && grounding.webSearchQueries.size === 0) {
    return '';
  }

  const lines: string[] = ['', '', '### Sources:'];
  if (grounding.sources.length > 0) {
    for (const src of grounding.sources) {
      const sanitizedTitle = src.title.replace(/[\[\]]/g, '');
      lines.push(`- [${sanitizedTitle}](${src.url})`);
    }
  } else if (grounding.webSearchQueries.size > 0) {
    for (const q of grounding.webSearchQueries) {
      lines.push(`- *Search:* ${q}`);
    }
  }

  return lines.join('\n');
}

