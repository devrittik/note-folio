import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

const options: sanitizeHtml.IOptions = {
  allowedTags: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'br', 'hr',
    'ul', 'ol', 'li',
    'blockquote', 'pre', 'code',
    'em', 'strong', 'del',
    'a', 'img',
    'table', 'thead', 'tbody', 'tr', 'th', 'td'
  ],
  allowedAttributes: {
    a: ['href', 'title', 'rel', 'target'],
    img: ['src', 'alt', 'title', 'width', 'height'],
    code: ['class'],
    th: ['align'],
    td: ['align']
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesByTag: { img: ['http', 'https'] },
  allowProtocolRelative: false,
  disallowedTagsMode: 'discard',
  transformTags: {
    a: (tagName, attribs) => {
      const href = attribs.href || '';
      if (!/^https?:\/\//i.test(href)) return { tagName, attribs };
      return {
        tagName,
        attribs: { ...attribs, target: '_blank', rel: 'noopener noreferrer' }
      };
    }
  }
};

export function renderMarkdown(source: string): string {
  const parsed = marked.parse(source || '', { async: false, gfm: true, breaks: false });
  if (typeof parsed !== 'string') return '';
  return sanitizeHtml(parsed, options);
}
