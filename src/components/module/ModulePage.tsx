import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';
import { MODULE_LIST } from '@/lib/constants';
import { useProgress } from '@/context/ProgressContext';
import LessonButton from './LessonButton';
import type { Module } from '@/types/module';
import mod01 from '@/data/modules/01-greetings.json';
import mod02 from '@/data/modules/02-food-ordering.json';
import mod03 from '@/data/modules/03-getting-around.json';
import mod04 from '@/data/modules/04-hotel-checkin.json';
import mod05 from '@/data/modules/05-small-talk.json';
import mod06 from '@/data/modules/06-emergencies.json';
import mod07 from '@/data/modules/07-shopping.json';
import mod08 from '@/data/modules/08-directions.json';

export default function ModulePage() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const { progress } = useProgress();

  const modMeta = MODULE_LIST.find((m) => m.id === moduleId);
  const modProgress = progress.modules[moduleId || ''];

  if (!modMeta) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">Module not found.</p>
        <Link to="/" className="text-primary-500 hover:underline text-sm mt-2 inline-block">
          ← Back to home
        </Link>
      </div>
    );
  }

  // Load module data (lazy import would be better, but for now import statically)
  const moduleData = getModuleData(moduleId || '');

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </Link>

        <div className="flex items-start gap-3">
          <span className="text-4xl">{modMeta.icon}</span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {modMeta.title}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {modMeta.titleEn}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              {modMeta.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            ~{modMeta.estimatedMinutes} min
          </span>
          {modProgress?.status === 'completed' && (
            <span className="text-green-500 font-medium">✓ Completed</span>
          )}
          {modProgress?.status === 'in_progress' && (
            <span className="text-primary-500 font-medium">In progress</span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {moduleData && moduleData.lessons.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
            <span>Progress</span>
            <span>
              {modProgress?.completedLessons || 0} / {moduleData.lessons.length} lessons
            </span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all duration-500"
              style={{
                width: `${Math.round(((modProgress?.completedLessons || 0) / moduleData.lessons.length) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Lessons list */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Lessons</h2>
        {moduleData ? (
          moduleData.lessons.map((lesson, idx: number) => {
            const lessonProgress = progress.lessons[lesson.id];
            const prevCompleted = idx === 0 || progress.lessons[moduleData.lessons[idx - 1]?.id]?.status === 'completed';
            return (
              <LessonButton
                key={lesson.id}
                moduleId={moduleId!}
                lessonId={lesson.id}
                title={lesson.title}
                titleEn={lesson.titleEn}
                order={idx + 1}
                status={lessonProgress?.status || (prevCompleted ? 'available' : 'locked')}
                score={lessonProgress?.score}
              />
            );
          })
        ) : (
          <p className="text-sm text-gray-400 dark:text-gray-500 italic py-8 text-center">
            Lesson content coming soon.
          </p>
        )}
      </div>
    </div>
  );
}

const MODULE_JSON_MAP: Record<string, Module> = {
  '01-greetings': mod01 as Module,
  '02-food-ordering': mod02 as Module,
  '03-getting-around': mod03 as Module,
  '04-hotel-checkin': mod04 as Module,
  '05-small-talk': mod05 as Module,
  '06-emergencies': mod06 as Module,
  '07-shopping': mod07 as Module,
  '08-directions': mod08 as Module,
};

function getModuleData(moduleId: string): Module | null {
  return MODULE_JSON_MAP[moduleId] || null;
}
