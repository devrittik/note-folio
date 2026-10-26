const WORDS_PER_MINUTE = 200;

type TextLike =
  | string
  | { type?: string; _type?: string; text?: string; children?: Array<{ text?: string }> };

function stripMarkdown(value: string): string {
  return value
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s{0,3}>\s?/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/[*_~]/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function extractReadableText(body: unknown): string {
  if (typeof body === 'string') return stripMarkdown(body);
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
