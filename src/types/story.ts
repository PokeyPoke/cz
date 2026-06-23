export interface StorySentence {
  id: string;
  czech: string;
  english: string;
}

export interface StoryParagraph {
  id: string;
  czech: string;
  english: string;
  sentences: StorySentence[];
}

export interface StoryVocabItem {
  word: string;
  pos: string;
  english: string;
  notes: string;
}

export interface Story {
  id: string;
  moduleId: string;
  title: string;
  titleEn: string;
  difficulty: 'beginner' | 'elementary' | 'intermediate' | 'upper-intermediate';
  estimatedMinutes: number;
  estimatedWords: number;
  description: string;
  paragraphs: StoryParagraph[];
  vocabulary: StoryVocabItem[];
}

export interface StoryDatabase {
  stories: Story[];
}

export interface StoryProgress {
  storyId: string;
  status: 'available' | 'reading' | 'completed';
  lastReadAt: string | null;
  comprehensionScore: number;
  readCount: number;
}
