import { CheckCircle2, Circle, Trash2 } from 'lucide-react';
import type { Task } from '../types/task';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (id: string, isCompleted: boolean) => void;
  onDelete: (id: string) => void;
}

export const TaskList = ({ tasks, onToggleComplete, onDelete }: TaskListProps) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400 text-lg">No tasks yet. Add one to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="group p-4 bg-slate-800 rounded-lg border border-slate-700 hover:border-emerald-500/50 transition-all"
        >
          <div className="flex items-start gap-3">
            <button
              onClick={() => onToggleComplete(task.id, !task.isCompleted)}
              className="shrink-0 text-slate-400 hover:text-emerald-500 transition-colors mt-0.5"
              aria-label={task.isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
            >
              {task.isCompleted ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              ) : (
                <Circle className="w-6 h-6" />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <h3
                className={`text-white font-medium ${
                  task.isCompleted ? 'line-through text-slate-500' : ''
                }`}
              >
                {task.description}
              </h3>
              {task.details && (
                <p
                  className={`mt-1 text-sm text-slate-400 ${
                    task.isCompleted ? 'line-through text-slate-600' : ''
                  }`}
                >
                  {task.details}
                </p>
              )}
            </div>

            <button
              onClick={() => onDelete(task.id)}
              className="shrink-0 text-slate-500 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Delete task"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
