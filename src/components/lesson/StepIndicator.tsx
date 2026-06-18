import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepIndicatorProps {
  steps: { label: string; icon: string }[];
  currentStep: number;
  completedSteps: number;
  onStepClick: (step: number) => void;
}

export default function StepIndicator({ steps, currentStep, completedSteps, onStepClick }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-1 px-2 py-3">
      {steps.map((step, idx) => {
        const isCompleted = idx < completedSteps;
        const isCurrent = idx === currentStep;

        return (
          <button
            key={idx}
            onClick={() => onStepClick(idx)}
            className="flex flex-col items-center gap-1"
          >
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all',
                isCompleted
                  ? 'bg-green-500 text-white'
                  : isCurrent
                  ? 'bg-primary-500 text-white ring-2 ring-primary-200 dark:ring-primary-800'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500',
              )}
            >
              {isCompleted ? <Check className="w-4 h-4" /> : step.icon}
            </div>
            <span
              className={cn(
                'text-[9px] font-medium text-center leading-tight max-w-[48px] hidden sm:block',
                isCurrent ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400',
              )}
            >
              {step.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
