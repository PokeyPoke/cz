import { useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useProgress } from '@/context/ProgressContext';
import StepIndicator from './StepIndicator';
import DialogueStep from './steps/DialogueStep';
import PhrasesStep from './steps/PhrasesStep';
import ShadowingStep from './steps/ShadowingStep';
import FillBlanksStep from './steps/FillBlanksStep';
import FlashcardsStep from './steps/FlashcardsStep';
import PronunciationStep from './steps/PronunciationStep';
import type { Module } from '@/types/module';

const STEP_LABELS = [
  { label: 'Listen', icon: '🎧' },
  { label: 'Phrases', icon: '💬' },
  { label: 'Shadow', icon: '🗣️' },
  { label: 'Fill In', icon: '✏️' },
  { label: 'Cards', icon: '🃏' },
  { label: 'Pronounce', icon: '🔊' },
];

export default function LessonPage() {
  const { moduleId, lessonId } = useParams<{ moduleId: string; lessonId: string }>();
  const navigate = useNavigate();
  const { progress, completeStep, completeLesson, isStepCompleted } = useProgress();
  const [currentStep, setCurrentStep] = useState(0);
  const [fillScore, setFillScore] = useState<number | null>(null);

  const moduleData = getModuleData(moduleId || '');
  const lesson = moduleData?.lessons.find((l) => l.id === lessonId);
  const lessonProgress = progress.lessons[lessonId || ''];
  const completedSteps = lessonProgress?.completedSteps || 0;

  const handleStepComplete = useCallback(() => {
    if (!lessonId || !moduleId || isStepCompleted(lessonId, currentStep)) return;
    completeStep(lessonId, moduleId, currentStep);
  }, [lessonId, moduleId, currentStep, completeStep, isStepCompleted]);

  const handleNext = useCallback(() => {
    if (currentStep < 5) {
      handleStepComplete();
      setCurrentStep((s) => Math.min(5, s + 1));
    }
  }, [currentStep, handleStepComplete]);

  const handlePrev = useCallback(() => {
    setCurrentStep((s) => Math.max(0, s - 1));
  }, []);

  const handleFillComplete = useCallback((score: number) => {
    setFillScore(score);
    handleStepComplete();
  }, [handleStepComplete]);

  const handleFinish = useCallback(() => {
    if (!lessonId || !moduleId) return;
    const score = fillScore ?? (lessonProgress?.score ?? 0);
    completeLesson(lessonId, moduleId, score);
    navigate(`/module/${moduleId}`);
  }, [lessonId, moduleId, fillScore, lessonProgress, completeLesson, navigate]);

  if (!moduleData || !lesson) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">Lesson not found.</p>
        <Link to="/" className="text-primary-500 hover:underline text-sm mt-2 inline-block">
          ← Back to home
        </Link>
      </div>
    );
  }

  const segments = lesson.segments;
  const segment = segments[currentStep];

  const renderStep = () => {
    if (!segment) return <p className="text-center text-gray-400 py-8">No content for this step.</p>;

    switch (segment.type) {
      case 'dialogue':
        return <DialogueStep segment={segment} onComplete={handleStepComplete} />;
      case 'phrases':
        return <PhrasesStep segment={segment} />;
      case 'shadowing':
        return <ShadowingStep segment={segment} onComplete={handleStepComplete} />;
      case 'fill-blanks':
        return <FillBlanksStep segment={segment} onComplete={handleFillComplete} />;
      case 'flashcards':
        return <FlashcardsStep segment={segment} onComplete={handleStepComplete} />;
      case 'pronunciation':
        return <PronunciationStep segment={segment} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
      {/* Top nav */}
      <div className="flex items-center justify-between">
        <Link
          to={`/module/${moduleId}`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {moduleData.title}
        </Link>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          Lesson {lesson.order} · {lesson.titleEn}
        </span>
      </div>

      {/* Step indicator */}
      <StepIndicator
        steps={STEP_LABELS}
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepClick={(s) => {
          if (s <= completedSteps) setCurrentStep(s);
        }}
      />

      {/* Step content */}
      <div className="min-h-[300px]">{renderStep()}</div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={handlePrev}
          disabled={currentStep === 0}
          className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>

        {currentStep < 5 ? (
          <button
            onClick={handleNext}
            className="inline-flex items-center gap-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-full transition-colors"
          >
            Next
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={handleFinish}
            className="inline-flex items-center gap-1 px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-full transition-colors"
          >
            Finish Lesson ✓
          </button>
        )}
      </div>
    </div>
  );
}

// Import module data
import mod01 from '@/data/modules/01-greetings.json';
import mod02 from '@/data/modules/02-food-ordering.json';
import mod03 from '@/data/modules/03-getting-around.json';
import mod04 from '@/data/modules/04-hotel-checkin.json';
import mod05 from '@/data/modules/05-small-talk.json';
import mod06 from '@/data/modules/06-emergencies.json';
import mod07 from '@/data/modules/07-shopping.json';
import mod08 from '@/data/modules/08-directions.json';

const MODULE_MAP: Record<string, Module> = {
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
  return MODULE_MAP[moduleId] || null;
}
