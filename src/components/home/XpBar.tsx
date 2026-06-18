interface XpBarProps {
  level: number;
  progress: number;
  xp: number;
}

export default function XpBar({ level, progress, xp }: XpBarProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-900/20 p-3">
      <span className="text-lg font-bold text-primary-600 dark:text-primary-300">
        {xp}
      </span>
      <div className="w-full max-w-[60px] h-1.5 bg-primary-100 dark:bg-primary-800 rounded-full mt-1 overflow-hidden">
        <div
          className="h-full bg-primary-500 rounded-full transition-all duration-500"
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>
      <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 mt-0.5">
        Lv.{level} · XP
      </span>
    </div>
  );
}
