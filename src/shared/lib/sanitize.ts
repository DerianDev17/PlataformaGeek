export function sanitizeHTML(dirty: string): string {
  const div = getParserDiv();
  div.textContent = dirty;
  return div.innerHTML;
}

function getParserDiv(): HTMLDivElement {
  if (typeof document === 'undefined') {
    return {
      textContent: '',
      get innerHTML() { return this.textContent || ''; },
    } as unknown as HTMLDivElement;
  }
  return document.createElement('div');
}

export function hasXSSRisk(content: string): boolean {
  const patterns = [
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /on\w+\s*=\s*["'][^"']*["']/gi,
    /on\w+\s*=\s*[^\s>]+/gi,
    /javascript\s*:/gi,
    /<iframe[\s\S]*?>/gi,
    /<embed[\s\S]*?>/gi,
    /<object[\s\S]*?>/gi,
    /<svg[\s\S]*?onload[\s\S]*?>/gi,
    /<img[^>]+onerror[\s\S]*?>/gi,
    /<details[\s\S]*?ontoggle[\s\S]*?>/gi,
    /<body[\s\S]*?onload[\s\S]*?>/gi,
    /<link[\s\S]*?>/gi,
    /<meta[\s\S]*?>/gi,
    /expression\s*\(/gi,
    /url\s*\(\s*["']?\s*javascript\s*:/gi,
    /<form[\s\S]*?action\s*=\s*["']?\s*javascript/gi,
  ];
  return patterns.some((p) => p.test(content));
}
