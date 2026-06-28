/**
 * HTML sanitization for user-generated content.
 *
 * IMPORTANT — current contract:
 *   `sanitizeHTML` is an ESCAPER, not an allowlist sanitizer. It replaces
 *   `< > " '` with HTML entities so the content is safe to render through
 *   `dangerouslySetInnerHTML` (any HTML the user writes is shown as text).
 *   It does NOT preserve formatting — there is no allowlist of tags, no
 *   markdown parsing, and no structural sanitization.
 *
 *   This means:
 *   - The DB stores encoded HTML.
 *   - The client renders it with `dangerouslySetInnerHTML` (text-only).
 *   - Authors cannot submit rich text today; the only safe "format" is plain
 *     text + line breaks.
 *
 * `hasXSSRisk` is kept as a soft pre-check to give a clearer 400 error when
 * a user pastes clearly-malicious input (e.g. literal `<script>` tags), even
 * though the encoder would already neutralize it. Removing this check would
 * not create a security gap — the encoder is the actual defense.
 *
 * Future: replace this module with a real allowlist sanitizer
 * (sanitize-html / DOMPurify) when a markdown editor is introduced.
 */

const XSS_PATTERNS = [
  /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
  /on\w+\s*=\s*["'][^"']*["']/gi,
  /javascript\s*:/gi,
  /<iframe[\s\S]*?>/gi,
];

export function sanitizeHTML(dirty: string): string {
  return dirty
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

export function sanitizeText(text: string): string {
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

export function hasXSSRisk(content: string): boolean {
  return XSS_PATTERNS.some((p) => p.test(content));
}
