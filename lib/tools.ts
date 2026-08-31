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
