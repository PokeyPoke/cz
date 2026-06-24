import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Upload, BookOpen, Clock, Trash2, FileText, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { listBooks, saveBook, deleteBook } from '@/services/ebookStorage';
import { parseEbook } from '@/services/ebookParser';
import type { StoredBook } from '@/types/ebook';

export default function EbooksPage() {
  const [books, setBooks] = useState<StoredBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const loadBooks = useCallback(async () => {
    try {
      const all = await listBooks();
      setBooks(all);
    } catch {
      setError('Failed to load library');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setUploading(true);

      try {
        const parsed = await parseEbook(file);
        const id = await saveBook({
          title: parsed.title,
          author: parsed.author,
          format: parsed.format,
          content: parsed.content,
          wordCount: parsed.wordCount,
          estimatedReadingTime: parsed.estimatedReadingTime,
          chapters: parsed.chapters,
        });
        await loadBooks();
        navigate(`/ebooks/${id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to upload book');
      } finally {
        setUploading(false);
      }
    },
    [loadBooks, navigate],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleDelete = useCallback(
    async (id: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!confirm('Delete this book? This cannot be undone.')) return;
      try {
        await deleteBook(id);
        await loadBooks();
      } catch {
        setError('Failed to delete book');
      }
    },
    [loadBooks],
  );

  const formatLastRead = (date: string | null): string => {
    if (!date) return 'Never read';
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          📚 My eBooks
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Upload Czech books and read with word-by-word pronunciation
        </p>
      </div>

      {/* Upload zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all',
          dragOver
            ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20'
            : 'border-gray-300 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 bg-gray-50 dark:bg-gray-900/50',
          uploading && 'opacity-50 pointer-events-none',
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md,.markdown"
          onChange={handleFileChange}
          className="hidden"
        />
        {uploading ? (
          <div className="space-y-2">
            <div className="w-8 h-8 mx-auto border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Uploading & parsing...</p>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="w-8 h-8 text-gray-400 mx-auto" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Drop a Czech text file here or click to browse
            </p>
            <p className="text-xs text-gray-400">
              Supported formats: .txt, .md
            </p>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Book list */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8">
            <div className="w-6 h-6 mx-auto border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto" />
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-3">
              No eBooks yet
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Upload a Czech text file (.txt or .md) to get started
            </p>
          </div>
        ) : (
          books.map((book) => (
            <Link
              key={book.id}
              to={`/ebooks/${book.id}`}
              className="flex items-start gap-3 p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700 transition-all group"
            >
              {/* Icon */}
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary-500" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                    {book.title}
                  </h3>
                  <span className="text-[10px] uppercase text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                    {book.format}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>{book.estimatedReadingTime} min read</span>
                  <span>·</span>
                  <span>{book.wordCount.toLocaleString()} words</span>
                </div>

                {/* Progress bar */}
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-gray-400">
                    <span>
                      {book.progressPercentage > 0
                        ? `${book.progressPercentage}% read`
                        : 'Not started'}
                    </span>
                    <span>Last read: {formatLastRead(book.lastReadAt)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all"
                      style={{ width: `${book.progressPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Delete */}
              <button
                onClick={(e) => handleDelete(book.id, e)}
                className="flex-shrink-0 p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                title="Delete book"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
