import type { ParsedBook } from '@/types/ebook';

/**
 * Parse a plain text file into a normalized ParsedBook.
 */
export async function parseTxt(file: File): Promise<ParsedBook> {
  const content = await file.text();
  if (!content.trim()) {
    throw new Error('File is empty');
  }

  const title = file.name.replace(/\.(txt|md)$/i, '').replace(/[-_]/g, ' ').trim();
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const estimatedReadingTime = Math.max(1, Math.round(wordCount / 150));

  // Detect chapters from blank-line-separated sections starting with cap letter
  const chapters = detectChaptersFromText(content);

  return {
    title: title || 'Untitled',
    content: normalizeText(content),
    wordCount,
    format: 'txt',
    chapters: chapters.length > 1 ? chapters : undefined,
    estimatedReadingTime,
  };
}

/**
 * Parse a Markdown file into a normalized ParsedBook.
 */
export async function parseMd(file: File): Promise<ParsedBook> {
  const raw = await file.text();
  if (!raw.trim()) {
    throw new Error('File is empty');
  }

  // Extract title from first # heading or filename
  const titleMatch = raw.match(/^#\s+(.+)$/m);
  const title = titleMatch
    ? titleMatch[1].trim()
    : file.name.replace(/\.(txt|md)$/i, '').replace(/[-_]/g, ' ').trim();

  // Detect chapters from ## headings
  const chapters = detectChaptersFromMd(raw);

  // Strip markdown formatting, keep text
  const content = stripMarkdown(raw);
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const estimatedReadingTime = Math.max(1, Math.round(wordCount / 150));

  return {
    title,
    content: normalizeText(content),
    wordCount,
    format: 'md',
    chapters: chapters.length > 1 ? chapters : undefined,
    estimatedReadingTime,
  };
}

/**
 * Parse any supported file type. Auto-detects format from extension.
 */
export async function parseEbook(file: File): Promise<ParsedBook> {
  const ext = file.name.split('.').pop()?.toLowerCase();

  switch (ext) {
    case 'txt':
      return parseTxt(file);
    case 'md':
    case 'markdown':
      return parseMd(file);
    default:
      throw new Error(
        `Unsupported format: .${ext}. Supported formats: .txt, .md`,
      );
  }
}

// ── Helpers ────────────────────────────────────────────

function normalizeText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n') // collapse 3+ newlines to 2
    .trim();
}

function stripMarkdown(md: string): string {
  return md
    .replace(/^#{1,6}\s+/gm, '') // headers
    .replace(/\*\*(.+?)\*\*/g, '$1') // bold
    .replace(/\*(.+?)\*/g, '$1') // italic
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // links
    .replace(/!\[.*?\]\(.+?\)/g, '') // images
    .replace(/`{1,3}[^`]*`{1,3}/g, '') // code
    .replace(/^>\s+/gm, '') // blockquotes
    .replace(/^[-*+]\s+/gm, '') // unordered lists
    .replace(/^\d+\.\s+/gm, '') // ordered lists
    .replace(/^---+/gm, '') // horizontal rules
    .trim();
}

function detectChaptersFromText(text: string): { id: string; title: string; startIndex: number }[] {
  const chapters: { id: string; title: string; startIndex: number }[] = [];
  const paragraphs = text.split(/\n{2,}/).filter((p) => p.trim());
  let charIndex = 0;

  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i];
    const trimmed = p.trim();
    // Heuristic: short line starting with capital letter = chapter title
    if (
      trimmed.length < 80 &&
      /^[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]/.test(trimmed) &&
      !trimmed.match(/[.!?,;:]$/) // not a sentence fragment
    ) {
      chapters.push({
        id: `ch-${chapters.length}`,
        title: trimmed,
        startIndex: charIndex,
      });
    }
    charIndex += p.length + 2; // +2 for double newline
  }

  return chapters;
}

function detectChaptersFromMd(md: string): { id: string; title: string; startIndex: number }[] {
  const chapters: { id: string; title: string; startIndex: number }[] = [];
  const regex = /^##\s+(.+)$/gm;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(md)) !== null) {
    chapters.push({
      id: `ch-${chapters.length}`,
      title: match[1].trim(),
      startIndex: match.index,
    });
  }

  return chapters;
}
