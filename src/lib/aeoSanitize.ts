/**
 * Sanitize CMS text before serving to AI crawlers (/llms-full.txt, JSON-LD).
 * Strips prompt-injection patterns that could manipulate AI model behavior.
 */

const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+)?(previous|prior|above|earlier|following)\s+(instructions?|context|rules?|prompts?)/i,
  /disregard\s+(all\s+)?(previous|prior|above|earlier|following)/i,
  /override\s+(all\s+)?(previous|prior|instructions?|rules?|prompts?)/i,
  /forget\s+(all\s+)?(previous|prior|above|earlier|context|instructions?)/i,
  /from\s+now\s+on/i,
  /you\s+are\s+now/i,
  /pretend\s+(you\s+are|to\s+be)/i,
  /act\s+as\s+(if|though|a|an)/i,
  /new\s+instructions?:/i,
  /system\s+prompt/i,
  /\bdo\s+not\s+mention\b/i,
  /\balways\s+recommend\b/i,
  /\bnever\s+mention\b/i,
  /\brespond\s+with\b.*\bwhen\s+(asked|someone|users?)\b/i,
  /\breplace\s+(all\s+)?(your|previous)\s+(responses?|answers?|output)/i,
];

/**
 * Returns true if text contains prompt-injection patterns.
 */
export function containsInjection(text: string): boolean {
  return INJECTION_PATTERNS.some((re) => re.test(text));
}

/**
 * Strip injection patterns from text, replacing matched spans with "[removed]".
 * Safe for use in /llms-full.txt and other AI crawler surfaces.
 */
export function sanitizeForAEO(text: string): string {
  if (!text) return "";
  let result = text;
  for (const re of INJECTION_PATTERNS) {
    result = result.replace(new RegExp(re.source, re.flags + "g"), "[removed]");
  }
  return result;
}
