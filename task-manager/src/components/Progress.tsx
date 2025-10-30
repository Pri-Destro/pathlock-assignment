interface ProgressProps {
  completed: number;
  total: number;
}

export const Progress = ({ completed, total }: ProgressProps) => {
  const percentage = total === 0 ? 0 : (completed / total) * 100;
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-48 h-48">
        <svg className="transform -rotate-90 w-48 h-48">
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="none"
            className="text-slate-700"
          />
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="text-emerald-500 transition-all duration-500 ease-out"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-5xl font-bold text-white">
            {Math.round(percentage)}%
          </div>
          <div className="text-sm text-slate-400 mt-1">Complete</div>
        </div>
      </div>
      <div className="flex gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span className="text-slate-300">
            {completed} Completed
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-slate-700"></div>
          <span className="text-slate-300">
            {total - completed} Remaining
          </span>
        </div>
      </div>
    </div>
  );
};
