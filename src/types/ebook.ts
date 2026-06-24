export interface ParsedBook {
  title: string;
  author?: string;
  content: string;
  wordCount: number;
  format: 'txt' | 'md';
  chapters?: BookChapter[];
  estimatedReadingTime: number; // minutes
}

export interface BookChapter {
  id: string;
  title: string;
  startIndex: number; // character index in content
}

export interface StoredBook {
  id: string;
  title: string;
  author?: string;
  uploadedAt: string;
  format: 'txt' | 'md';
  content: string;
  wordCount: number;
  estimatedReadingTime: number;
  currentWordIndex: number;
  progressPercentage: number;
  lastReadAt: string | null;
  chapters?: BookChapter[];
}

export interface ReadingNote {
  id: string;
  wordIndex: number;
  text: string;
  timestamp: string;
}

export interface WordTiming {
  word: string;
  startChar: number;
  endChar: number;
  startTime: number; // ms from start
  endTime: number; // ms from start
}

export interface EbookProgressState {
  bookId: string;
  title: string;
  progressPercent: number;
  currentWordIndex: number;
  wordsRead: number;
  lastReadAt: string | null;
  completed: boolean;
  completedAt: string | null;
}

export interface EbookSettings {
  fontSize: number;
  lineHeight: number;
  fontFamily: 'serif' | 'sans-serif';
  darkMode: boolean;
  showWordHighlighting: boolean;
}
