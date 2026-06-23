import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  BookOpen,
  FileText,
  Search,
  BookMarked,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStoryProgress, getDifficultyColor } from '@/hooks/useStoryProgress';
import { isTtsSupported } from '@/services/tts';
import TextToSpeechControls from './TextToSpeechControls';
import WordGlossaryPopup from './WordGlossaryPopup';
import storiesData from '@/data/stories.json';
import type { Story, StoryVocabItem } from '@/types/story';

const stories: Story[] = storiesData.stories as Story[];

type TabId = 'full-text' | 'word-by-word' | 'glossary';

interface PopupState {
  word: string;
  vocabItem: StoryVocabItem | undefined;
  position: { top: number; left: number };
  contextCz?: string;
  contextEn?: string;
}

export default function StoryReader() {
  const { storyId } = useParams<{ storyId: string }>();
  const [activeTab, setActiveTab] = useState<TabId>('full-text');
  const [popup, setPopup] = useState<PopupState | null>(null);
  const [revealedSentences, setRevealedSentences] = useState<Set<string>>(new Set());
  const [scrollProgress, setScrollProgress] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const story = useMemo(() => stories.find((s) => s.id === storyId), [storyId]);
  const { handleStartReading, handleCompleteReading, completed } = useStoryProgress(storyId || '');
  const ttsSupported = isTtsSupported();

  const storyIndex = useMemo(() => stories.findIndex((s) => s.id === storyId), [storyId]);
  const prevStory = storyIndex > 0 ? stories[storyIndex - 1] : null;
  const nextStory = storyIndex < stories.length - 1 ? stories[storyIndex + 1] : null;

  // Mark story as started
  useEffect(() => {
    if (story) {
      handleStartReading();
    }
  }, [story?.id]);

  // Track scroll progress
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const pct = Math.round((scrollTop / (scrollHeight - clientHeight)) * 100);
      setScrollProgress(Math.min(100, Math.max(0, pct)));
    };
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  // Build vocabulary lookup map
  const vocabMap = useMemo(() => {
    if (!story) return new Map<string, StoryVocabItem>();
    const map = new Map<string, StoryVocabItem>();
    for (const v of story.vocabulary) {
      // Normalize: lowercase, strip punctuation
      const key = v.word.toLowerCase().replace(/[.,!?;:"'«»"„"]/g, '').trim();
      map.set(key, v);
    }
    return map;
  }, [story]);

  // Find vocabulary match for a word
  const findVocabItem = useCallback(
    (word: string): StoryVocabItem | undefined => {
      const clean = word.toLowerCase().replace(/[.,!?;:"'«»"„"]/g, '').trim();
      // Exact match first
      if (vocabMap.has(clean)) return vocabMap.get(clean);
      // Try partial match (e.g., declined forms)
      for (const [key, item] of vocabMap) {
        if (clean.includes(key) || key.includes(clean)) {
          return item;
        }
      }
      return undefined;
    },
    [vocabMap],
  );

  const handleWordClick = useCallback(
    (word: string, e: React.MouseEvent, contextCz?: string, contextEn?: string) => {
      const vocabItem = findVocabItem(word);
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setPopup({
        word,
        vocabItem,
        position: {
          top: rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX,
        },
        contextCz,
        contextEn,
      });
    },
    [findVocabItem],
  );

  const closePopup = useCallback(() => setPopup(null), []);

  const handleMarkComplete = useCallback(() => {
    // Simple comprehension: count vocabulary words understood
    const understoodCount = story?.vocabulary.length || 0;
    const score = Math.min(100, Math.round((understoodCount / Math.max(1, understoodCount)) * 100));
    handleCompleteReading(score);
  }, [story, handleCompleteReading]);

  const toggleRevealSentence = useCallback((sentenceId: string) => {
    setRevealedSentences((prev) => {
      const next = new Set(prev);
      if (next.has(sentenceId)) {
        next.delete(sentenceId);
      } else {
        next.add(sentenceId);
      }
      return next;
    });
  }, []);

  if (!story) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mt-4">
          Story not found
        </h2>
        <Link
          to="/stories"
          className="inline-flex items-center gap-1.5 mt-4 text-sm text-primary-500 hover:text-primary-600"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Stories
        </Link>
      </div>
    );
  }

  const difficulty = getDifficultyColor(story.difficulty);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      {/* Back button + header */}
      <div className="flex items-center gap-3">
        <Link
          to="/stories"
          className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">
            {story.title}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">{story.titleEn}</p>
        </div>
      </div>

      {/* Story metadata */}
      <div className="flex items-center gap-3 flex-wrap">
        <span
          className={cn(
            'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
            difficulty.bg,
            difficulty.text,
          )}
        >
          {difficulty.label}
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-gray-400">
          <Clock className="w-3 h-3" />
          {story.estimatedMinutes} min
        </span>
        <span className="text-xs text-gray-400">{story.estimatedWords} words</span>
        {completed && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </span>
        )}
      </div>

      {/* Scroll progress */}
      <div className="w-full h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary-500 rounded-full transition-all duration-300"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {([
          { id: 'full-text' as TabId, label: 'Full Text', icon: FileText },
          { id: 'word-by-word' as TabId, label: 'Word-by-Word', icon: Search },
          { id: 'glossary' as TabId, label: 'Glossary', icon: BookMarked },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
              activeTab === tab.id
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300',
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div ref={contentRef} className="max-h-[60vh] overflow-y-auto rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        {/* Full Text tab */}
        {activeTab === 'full-text' && (
          <div className="p-6 space-y-6">
            {story.paragraphs.map((paragraph) => (
              <div key={paragraph.id} className="space-y-3">
                {/* Paragraph-level TTS */}
                {ttsSupported && (
                  <TextToSpeechControls
                    text={paragraph.czech}
                    label="Read paragraph"
                    compact
                    className="mb-1"
                  />
                )}
                {/* Czech text */}
                <p className="text-base leading-relaxed text-gray-900 dark:text-white">
                  {paragraph.sentences.map((sentence) => (
                    <span key={sentence.id} className="group relative">
                      <span
                        className="cursor-pointer hover:bg-primary-100 dark:hover:bg-primary-900/30 rounded px-0.5 transition-colors"
                        onClick={(e) => handleWordClick(sentence.czech, e, sentence.czech, sentence.english)}
                        title="Click for pronunciation and definition"
                      >
                        {sentence.czech}
                      </span>
                      {/* Sentence-level TTS */}
                      {ttsSupported && (
                        <span className="inline-flex ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <TextToSpeechControls text={sentence.czech} compact />
                        </span>
                      )}
                      {' '}
                    </span>
                  ))}
                </p>
                {/* English translation */}
                <p className="text-sm text-gray-500 dark:text-gray-400 italic pl-2 border-l-2 border-gray-200 dark:border-gray-700">
                  {paragraph.english}
                </p>
              </div>
            ))}

            {/* Mark as complete button */}
            {!completed && (
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={handleMarkComplete}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl text-sm transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  I've read this story
                </button>
              </div>
            )}
          </div>
        )}

        {/* Word-by-Word tab */}
        {activeTab === 'word-by-word' && (
          <div className="p-6 space-y-4">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Tap any word to see its definition. Tap 🔊 to hear pronunciation.
            </p>
            {story.paragraphs.map((paragraph) => (
              <div key={paragraph.id} className="space-y-2">
                <div className="flex flex-wrap gap-x-1.5 gap-y-2">
                  {paragraph.sentences.map((sentence) => (
                    <span key={sentence.id} className="inline">
                      {sentence.czech.split(/(\s+)/).filter((w) => w.trim()).map((word, wi) => {
                        const hasVocab = findVocabItem(word);
                        return (
                          <button
                            key={`${sentence.id}-${wi}`}
                            onClick={(e) => handleWordClick(word, e, sentence.czech, sentence.english)}
                            className={cn(
                              'inline-block px-1 py-0.5 rounded text-sm transition-colors hover:bg-primary-100 dark:hover:bg-primary-900/30',
                              hasVocab
                                ? 'text-primary-600 dark:text-primary-400 font-medium underline decoration-dotted underline-offset-2'
                                : 'text-gray-900 dark:text-white',
                            )}
                            title={hasVocab ? hasVocab.english : undefined}
                          >
                            {word}
                          </button>
                        );
                      })}
                      {' '}
                      {ttsSupported && (
                        <TextToSpeechControls
                          text={sentence.czech}
                          compact
                          className="ml-0.5 align-middle"
                        />
                      )}
                      <span className="inline-block w-4" />
                    </span>
                  ))}
                </div>
                {/* English reveal */}
                <button
                  onClick={() => toggleRevealSentence(paragraph.id)}
                  className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {revealedSentences.has(paragraph.id) ? paragraph.english : 'Show translation'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Glossary tab */}
        {activeTab === 'glossary' && (
          <div className="p-6">
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
              Complete vocabulary list for this story. Tap 🔊 to hear each word.
            </p>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {story.vocabulary.map((item, idx) => (
                <div key={idx} className="py-3 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-gray-900 dark:text-white">
                        {item.word}
                      </span>
                      <span className="text-[10px] text-gray-400 uppercase">{item.pos}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">
                      {item.english}
                    </p>
                    {item.notes && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        {item.notes}
                      </p>
                    )}
                  </div>
                  {ttsSupported && (
                    <TextToSpeechControls text={item.word} compact label="Play" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom navigation */}
      <div className="flex items-center justify-between pt-2">
        {prevStory ? (
          <Link
            to={`/stories/${prevStory.id}`}
            className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{prevStory.title}</span>
            <span className="sm:hidden">Previous</span>
          </Link>
        ) : (
          <div />
        )}

        <span className="text-xs text-gray-400">
          Story {storyIndex + 1} of {stories.length}
        </span>

        {nextStory ? (
          <Link
            to={`/stories/${nextStory.id}`}
            className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
          >
            <span className="hidden sm:inline">{nextStory.title}</span>
            <span className="sm:hidden">Next</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        ) : (
          <div />
        )}
      </div>

      {/* Word glossary popup */}
      {popup && (
        <WordGlossaryPopup
          word={popup.word}
          vocabItem={popup.vocabItem}
          position={popup.position}
          contextCz={popup.contextCz}
          contextEn={popup.contextEn}
          onClose={closePopup}
        />
      )}
    </div>
  );
}
