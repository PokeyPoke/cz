export interface Module {
  id: string;
  slug: string;
  title: string;
  titleEn: string;
  description: string;
  order: number;
  icon: string;
  estimatedMinutes: number;
  lessons: Lesson[];
  prerequisites?: string[];
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  titleEn: string;
  order: number;
  segments: LessonSegment[];
  vocabulary: VocabItem[];
  grammarNotes?: string;
}

export type LessonSegment =
  | DialogueSegment
  | PhrasesSegment
  | ShadowingSegment
  | FillBlanksSegment
  | FlashcardsSegment
  | PronunciationSegment;

export interface DialogueSegment {
  type: 'dialogue';
  audioSrc: string;
  audioFallbackSrc?: string;
  title?: string;
  context?: string;
  lines: DialogueLine[];
}

export interface DialogueLine {
  speaker: string;
  czech: string;
  english: string;
  startTime: number;
  endTime: number;
  audioSrc?: string;
}

export interface PhrasesSegment {
  type: 'phrases';
  title?: string;
  phrases: Phrase[];
}

export interface Phrase {
  id: string;
  czech: string;
  english: string;
  transliteration?: string;
  notes?: string;
  audioSrc?: string;
}

export interface ShadowingSegment {
  type: 'shadowing';
  title?: string;
  phrases: ShadowingPhrase[];
}

export interface ShadowingPhrase {
  id: string;
  czech: string;
  english?: string;
  audioSrc: string;
  pauseAfterMs: number;
}

export interface FillBlanksSegment {
  type: 'fill-blanks';
  title?: string;
  instructions?: string;
  lines: BlankLine[];
}

export interface BlankLine {
  czechBefore: string;
  czechAfter: string;
  english: string;
  blanks: Blank[];
}

export interface Blank {
  id: string;
  correctAnswer: string;
  acceptableAnswers?: string[];
  hint?: string;
}

export interface FlashcardsSegment {
  type: 'flashcards';
  title?: string;
  cards: FlashcardData[];
}

export interface FlashcardData {
  id: string;
  front: string;
  back: string;
  exampleSentence?: string;
  audioSrc?: string;
}

export interface PronunciationSegment {
  type: 'pronunciation';
  title?: string;
  tips: PronunciationTip[];
}

export interface PronunciationTip {
  focus: string;
  description: string;
  czechExamples: string[];
  audioSrc?: string;
}

export interface VocabItem {
  czech: string;
  english: string;
  partOfSpeech: string;
  notes?: string;
}
