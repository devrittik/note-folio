const WORDS_PER_MINUTE = 200;

type TextLike =
  | string
  | { type?: string; _type?: string; text?: string; children?: Array<{ text?: string }> };

export function extractReadableText(body: unknown): string {
  if (!Array.isArray(body)) return '';

  return body
    .map((item: TextLike) => {
      if (typeof item === 'string') return item;
      if (typeof item?.text === 'string') return item.text;
      if (Array.isArray(item?.children)) {
        return item.children.map((child) => child.text || '').join(' ');
      }
      return '';
    })
    .filter(Boolean)
    .join(' ');
}

export function calculateReadTime(body: unknown): number {
  const text = extractReadableText(body).trim();
  if (!text) return 1;
  const words = text.split(/\s+/u).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}
