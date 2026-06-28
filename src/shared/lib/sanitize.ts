export function sanitizeHTML(dirty: string): string {
  return dirty
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
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
