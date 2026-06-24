import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Settings, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getBook, updateProgress } from '@/services/ebookStorage';
import { speak, stop, pause, resume, isSpeaking, isPaused, isTtsSupported } from '@/services/tts';
import { useWordHighlighting } from '@/hooks/useWordHighlighting';
import EbookTtsControls from './EbookTtsControls';
import type { StoredBook, EbookSettings } from '@/types/ebook';

const DEFAULT_SETTINGS: EbookSettings = {
  fontSize: 18,
  lineHeight: 1.8,
  fontFamily: 'serif',
  darkMode: false,
  showWordHighlighting: true,
};

export default function EbookReader() {
  const { bookId } = useParams<{ bookId: string }>();
  const [book, setBook] = useState<StoredBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<EbookSettings>(() => {
    try {
      const saved = localStorage.getItem('cz-ebook-settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });
  const [showSettings, setShowSettings] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [ttsSpeed, setTtsSpeed] = useState(0.8);
  const [ttsMode, setTtsMode] = useState<'sentence' | 'continuous'>('sentence');
  const [isTtsPlaying, setIsTtsPlaying] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const autoSaveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ttsSupported = isTtsSupported();

  // Save settings when changed
  useEffect(() => {
    localStorage.setItem('cz-ebook-settings', JSON.stringify(settings));
  }, [settings]);

  // Load book
  useEffect(() => {
    if (!bookId) return;
    getBook(bookId)
      .then((b) => {
        if (b) setBook(b);
        else setError('Book not found');
      })
      .catch(() => setError('Failed to load book'))
      .finally(() => setLoading(false));
  }, [bookId]);

  // Parse paragraphs and sentences
  const paragraphs = useMemo(() => {
    if (!book) return [];
    return book.content
      .split(/\n{2,}/)
      .filter((p) => p.trim())
      .map((p, pi) => {
        // Split paragraph into sentences
        const sentences = p
          .replace(/\n/g, ' ')
          .split(/(?<=[.!?])\s+(?=[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ"„"])/g)
          .filter((s) => s.trim());
        return { id: `p-${pi}`, text: p.trim(), sentences };
      });
  }, [book]);

  // Build full text for TTS (flatten paragraphs with pauses)
  const fullText = useMemo(() => {
    return paragraphs.map((p) => p.text).join('\n\n');
  }, [paragraphs]);

  // Word highlighting hook
  const {
    currentWordIndex: ttsWordIndex,
    isPlaying: highlightPlaying,
    startPlayback: startHighlighting,
    stopPlayback: stopHighlighting,
    totalDuration,
    elapsedTime,
  } = useWordHighlighting({
    text: fullText,
    speechRate: ttsSpeed,
    onComplete: () => {
      setIsTtsPlaying(false);
      stop();
    },
  });

  // Sync TTS state
  useEffect(() => {
    const interval = setInterval(() => {
      const speaking = isSpeaking();
      if (!speaking && isTtsPlaying && !highlightPlaying) {
        setIsTtsPlaying(false);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [isTtsPlaying, highlightPlaying]);

  // Auto-save progress every 10 seconds
  useEffect(() => {
    if (!bookId || !book) return;
    autoSaveRef.current = setInterval(() => {
      updateProgress(bookId, {
        currentWordIndex: book.currentWordIndex,
        progressPercentage: scrollProgress,
      });
    }, 10000);
    return () => {
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);
    };
  }, [bookId, book, scrollProgress]);

  // Save progress on unmount
  useEffect(() => {
    return () => {
      if (bookId && scrollProgress > 0) {
        updateProgress(bookId, { progressPercentage: scrollProgress });
      }
    };
  }, [bookId, scrollProgress]);

  // Scroll tracking
  const handleScroll = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const pct = Math.round((scrollTop / (scrollHeight - clientHeight)) * 100);
    setScrollProgress(Math.min(100, Math.max(0, pct)));
  }, []);

  // Sentence tap handler
  const handleSentenceTap = useCallback(
    (sentence: string) => {
      if (ttsMode !== 'sentence') return;
      stop();
      speak(sentence, ttsSpeed);
    },
    [ttsMode, ttsSpeed],
  );

  // Continuous TTS
  const handlePlayContinuous = useCallback(() => {
    stop();
    setIsTtsPlaying(true);
    speak(fullText, ttsSpeed);
    startHighlighting();
  }, [fullText, ttsSpeed, startHighlighting]);

  const handlePauseTts = useCallback(() => {
    if (isPaused()) {
      resume();
      setIsTtsPlaying(true);
    } else {
      pause();
      setIsTtsPlaying(false);
    }
  }, []);

  const handleStopTts = useCallback(() => {
    stop();
    stopHighlighting();
    setIsTtsPlaying(false);
  }, [stopHighlighting]);

  // Settings handlers
  const updateSetting = useCallback(
    <K extends keyof EbookSettings>(key: K, value: EbookSettings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  // Determine if we should apply dark mode
  const isDark = settings.darkMode;

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {error || 'Book not found'}
        </h2>
        <Link
          to="/ebooks"
          className="inline-flex items-center gap-1.5 mt-4 text-sm text-primary-500 hover:text-primary-600"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Library
        </Link>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'min-h-dvh flex flex-col',
        isDark ? 'bg-gray-950 text-gray-100' : 'bg-white text-gray-900',
      )}
    >
      {/* Header */}
      <header
        className={cn(
          'sticky top-0 z-40 flex items-center justify-between px-4 h-14 border-b safe-top',
          isDark
            ? 'bg-gray-950/95 border-gray-800 backdrop-blur-sm'
            : 'bg-white/95 border-gray-200 backdrop-blur-sm',
        )}
      >
        <Link
          to="/ebooks"
          className={cn(
            'flex items-center gap-1.5 text-sm hover:opacity-70 transition-opacity',
            isDark ? 'text-gray-300' : 'text-gray-600',
          )}
        >
          <ArrowLeft className="w-4 h-4" />
          Library
        </Link>

        <h1 className="text-sm font-semibold truncate max-w-[50%]">{book.title}</h1>

        <button
          onClick={() => setShowSettings(true)}
          className={cn(
            'p-1.5 rounded-full transition-colors',
            isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500',
          )}
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </header>

      {/* Scroll progress bar */}
      <div
        className={cn(
          'sticky top-14 z-30 w-full h-0.5',
          isDark ? 'bg-gray-800' : 'bg-gray-200',
        )}
      >
        <div
          className="h-full bg-primary-500 transition-all duration-300"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto"
        style={{
          fontSize: `${settings.fontSize}px`,
          lineHeight: settings.lineHeight,
          fontFamily: settings.fontFamily === 'serif' ? 'Georgia, "Times New Roman", serif' : 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
          {/* Chapter navigation */}
          {book.chapters && book.chapters.length > 0 && (
            <details className="mb-6">
              <summary
                className={cn(
                  'text-xs cursor-pointer font-medium',
                  isDark ? 'text-gray-400' : 'text-gray-500',
                )}
              >
                Chapters ({book.chapters.length})
              </summary>
              <div className="mt-2 space-y-1">
                {book.chapters.map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => {
                      const el = document.getElementById(ch.id);
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={cn(
                      'block w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors',
                      isDark
                        ? 'hover:bg-gray-800 text-gray-300'
                        : 'hover:bg-gray-100 text-gray-600',
                    )}
                  >
                    {ch.title}
                  </button>
                ))}
              </div>
            </details>
          )}

          {/* Render paragraphs */}
          {paragraphs.map((para) => (
            <div key={para.id} id={para.id} className="space-y-1">
              {ttsMode === 'continuous' && settings.showWordHighlighting ? (
                // Continuous mode: word-level highlighting
                <p>
                  {fullText
                    .substring(
                      fullText.indexOf(para.text),
                      fullText.indexOf(para.text) + para.text.length,
                    )
                    .split(/\s+/)
                    .filter(Boolean)
                    .map((word, wi) => {
                      const globalWordIndex =
                        fullText
                          .substring(0, fullText.indexOf(para.text))
                          .split(/\s+/)
                          .filter(Boolean).length + wi;
                      return (
                        <span
                          key={wi}
                          className={cn(
                            'transition-colors rounded px-0.5',
                            globalWordIndex === ttsWordIndex && isTtsPlaying
                              ? 'bg-primary-300 dark:bg-primary-600 text-primary-900 dark:text-primary-100'
                              : '',
                          )}
                        >
                          {word}{' '}
                        </span>
                      );
                    })}
                </p>
              ) : (
                // Sentence mode: clickable sentences
                para.sentences.map((sentence, si) => (
                  <span
                    key={si}
                    onClick={() => handleSentenceTap(sentence)}
                    className={cn(
                      'cursor-pointer transition-colors rounded-sm',
                      ttsMode === 'sentence'
                        ? isDark
                          ? 'hover:bg-gray-800'
                          : 'hover:bg-gray-100'
                        : '',
                    )}
                    title={ttsMode === 'sentence' ? 'Tap to hear' : undefined}
                  >
                    {sentence}{' '}
                  </span>
                ))
              )}
            </div>
          ))}

          {/* End of book */}
          <div className="text-center py-8">
            <p
              className={cn(
                'text-sm',
                isDark ? 'text-gray-600' : 'text-gray-400',
              )}
            >
              — End of "{book.title}" —
            </p>
          </div>
        </div>
      </div>

      {/* TTS Controls */}
      {ttsSupported && (
        <EbookTtsControls
          isPlaying={isTtsPlaying}
          onPlay={handlePlayContinuous}
          onPause={handlePauseTts}
          onStop={handleStopTts}
          speed={ttsSpeed}
          onSpeedChange={setTtsSpeed}
          mode={ttsMode}
          onModeChange={(m) => {
            setTtsMode(m);
            handleStopTts();
          }}
          elapsedTime={elapsedTime}
          totalDuration={totalDuration}
        />
      )}

      {!ttsSupported && (
        <div
          className={cn(
            'text-center py-2 text-xs',
            isDark ? 'text-gray-500' : 'text-gray-400',
          )}
        >
          Text-to-speech not supported in this browser
        </div>
      )}

      {/* Settings slide-over */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowSettings(false)}
          />

          {/* Panel */}
          <div
            className={cn(
              'relative w-72 max-w-[85vw] h-full overflow-y-auto shadow-xl p-6 space-y-6',
              isDark
                ? 'bg-gray-900 border-l border-gray-800'
                : 'bg-white border-l border-gray-200',
            )}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Reader Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Font size */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Font Size: {settings.fontSize}px
              </label>
              <input
                type="range"
                min={12}
                max={26}
                value={settings.fontSize}
                onChange={(e) => updateSetting('fontSize', Number(e.target.value))}
                className="w-full accent-primary-500"
              />
            </div>

            {/* Line height */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Line Height: {settings.lineHeight}em
              </label>
              <input
                type="range"
                min={1.4}
                max={2.6}
                step={0.1}
                value={settings.lineHeight}
                onChange={(e) => updateSetting('lineHeight', Number(e.target.value))}
                className="w-full accent-primary-500"
              />
            </div>

            {/* Font family */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Font
              </label>
              <div className="flex gap-2">
                {(['serif', 'sans-serif'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => updateSetting('fontFamily', f)}
                    className={cn(
                      'flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors capitalize',
                      settings.fontFamily === f
                        ? 'bg-primary-500 text-white'
                        : isDark
                          ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                    )}
                    style={{ fontFamily: f === 'serif' ? 'Georgia, serif' : 'system-ui, sans-serif' }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Dark mode */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Dark Mode</label>
              <button
                onClick={() => updateSetting('darkMode', !settings.darkMode)}
                className={cn(
                  'relative w-10 h-6 rounded-full transition-colors',
                  settings.darkMode ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-700',
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
                    settings.darkMode ? 'translate-x-[1.125rem]' : 'translate-x-0.5',
                  )}
                />
              </button>
            </div>

            {/* Word highlighting toggle */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Word Highlighting</label>
              <button
                onClick={() => updateSetting('showWordHighlighting', !settings.showWordHighlighting)}
                className={cn(
                  'relative w-10 h-6 rounded-full transition-colors',
                  settings.showWordHighlighting
                    ? 'bg-primary-500'
                    : 'bg-gray-300 dark:bg-gray-700',
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
                    settings.showWordHighlighting ? 'translate-x-[1.125rem]' : 'translate-x-0.5',
                  )}
                />
              </button>
            </div>

            {/* Reset */}
            <button
              onClick={() => setSettings(DEFAULT_SETTINGS)}
              className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              Reset to defaults
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
