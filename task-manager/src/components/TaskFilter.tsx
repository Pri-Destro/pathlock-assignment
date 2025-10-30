import type { FilterType } from '../types/task';

interface TaskFilterProps {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  taskCounts: {
    all: number;
    active: number;
    completed: number;
  };
}

export const TaskFilter = ({ currentFilter, onFilterChange, taskCounts }: TaskFilterProps) => {
  const filters: { value: FilterType; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: taskCounts.all },
    { value: 'active', label: 'Active', count: taskCounts.active },
    { value: 'completed', label: 'Completed', count: taskCounts.completed },
  ];

  return (
    <div className="flex gap-2 p-1 bg-slate-800/50 rounded-lg border border-slate-700">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${
            currentFilter === filter.value
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          {filter.label}
          <span className="ml-2 text-sm opacity-70">({filter.count})</span>
        </button>
      ))}
    </div>
  );
};
