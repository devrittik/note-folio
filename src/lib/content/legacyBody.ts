import type { Screenshot } from '../data/types';

type TextRecord = Record<string, unknown>;

function asRecord(value: unknown): TextRecord | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  return value as TextRecord;
}

function textValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function normalizeCarouselImages(value: unknown): Screenshot[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    const record = asRecord(item);
    if (!record || typeof record.url !== 'string') return [];

    return [{
      url: record.url,
      alt: typeof record.alt === 'string' ? record.alt : '',
      caption: typeof record.caption === 'string' ? record.caption : undefined,
      width: typeof record.width === 'number' ? record.width : undefined,
      height: typeof record.height === 'number' ? record.height : undefined
    }];
  });
}

export function journalContentFromStored(body: unknown, figures: unknown): { body: string; figures: Screenshot[] } {
  const storedFigures = normalizeCarouselImages(figures);
  if (typeof body === 'string') return { body, figures: storedFigures };
  if (!Array.isArray(body)) return { body: '', figures: storedFigures };

  const paragraphs: string[] = [];
  const inlineFigures: Screenshot[] = [];

  for (const item of body) {
    if (typeof item === 'string') {
      const text = item.trim();
      if (text) paragraphs.push(text);
      continue;
    }

    const record = asRecord(item);
    if (!record) continue;

    const kind = record.type || record._type;
    if (kind === 'image') {
      const [image] = normalizeCarouselImages([record]);
      if (image) inlineFigures.push(image);
      continue;
    }

    const text = textValue(record.text);
    if (text) paragraphs.push(text);
  }

  return {
    body: paragraphs.join('\n\n'),
    figures: storedFigures.length > 0 ? storedFigures : inlineFigures
  };
}

type LegacyProject = {
  body?: unknown;
  problem?: unknown;
  system?: unknown;
  buildFeatures?: unknown;
  notes?: unknown;
  metrics?: unknown;
};

export function projectBodyFromStored(project: LegacyProject): string {
  if (typeof project.body === 'string' && project.body.trim()) return project.body;

  const sections: string[] = [];
  const problem = textValue(project.problem);
  if (problem) sections.push(`## The Problem\n\n${problem}`);

  if (Array.isArray(project.system) && project.system.length > 0) {
    const steps = project.system.flatMap((step) => {
      const record = asRecord(step);
      if (!record) return [];
      const title = textValue(record.title);
      const sub = textValue(record.sub);
      if (!title && !sub) return [];
      return [`- **${title}** — ${sub}`];
    });
    if (steps.length > 0) sections.push(`## The System\n\n${steps.join('\n')}`);
  }

  if (Array.isArray(project.buildFeatures) && project.buildFeatures.length > 0) {
    const features = project.buildFeatures.flatMap((feature) => {
      const text = textValue(feature);
      return text ? [`- ${text}`] : [];
    });
    if (features.length > 0) sections.push(`## The Build\n\n${features.join('\n')}`);
  }

  if (Array.isArray(project.notes) && project.notes.length > 0) {
    const notes = project.notes.flatMap((note, index) => {
      const record = asRecord(note);
      if (!record) return [];
      const number = String(index + 1).padStart(3, '0');
      return [[
        `### Note ${number}`,
        '',
        `**Challenge.** ${textValue(record.challenge)}`,
        '',
        `**Decision.** ${textValue(record.decision)}`,
        '',
        `**Tradeoff.** ${textValue(record.tradeoff)}`
      ].join('\n')];
    });
    if (notes.length > 0) sections.push(`## Engineering Notes\n\n${notes.join('\n\n')}`);
  }

  if (Array.isArray(project.metrics) && project.metrics.length > 0) {
    const metrics = project.metrics.flatMap((metric) => {
      const text = textValue(metric);
      return text ? [`- ${text}`] : [];
    });
    if (metrics.length > 0) sections.push(`## Result\n\n${metrics.join('\n')}`);
  }

  return sections.join('\n\n');
}
