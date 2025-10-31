import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Calendar, Clock } from 'lucide-react';
import { type Database } from '../lib/database.types';
import * as Checkbox from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';

type Task = Database['public']['Tables']['tasks']['Row'];

interface TaskScheduleData {
  taskId: string;
  dueDate: string;
  estimatedHours: number;
  dependencies: string[];
}

interface SmartScheduleDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  tasks: Task[];
}

export default function SmartScheduleDialog({ open, onClose, projectId, tasks }: SmartScheduleDialogProps) {
  const [scheduleData, setScheduleData] = useState<Record<string, TaskScheduleData>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateTaskSchedule = (taskId: string, field: keyof TaskScheduleData, value: string | number | string[]) => {
    setScheduleData(prev => ({
      ...prev,
      [taskId]: {
        taskId,
        dueDate: prev[taskId]?.dueDate || '',
        estimatedHours: prev[taskId]?.estimatedHours || 1,
        dependencies: prev[taskId]?.dependencies || [],
        [field]: value,
      }
    }));
  };

  const toggleDependency = (taskId: string, dependencyId: string) => {
    const currentDeps = scheduleData[taskId]?.dependencies || [];
    const newDeps = currentDeps.includes(dependencyId)
      ? currentDeps.filter(id => id !== dependencyId)
      : [...currentDeps, dependencyId];

    updateTaskSchedule(taskId, 'dependencies', newDeps);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const tasksToSchedule = tasks.filter(task => scheduleData[task.id]);

    if (tasksToSchedule.length === 0) {
      setError('Please configure at least one task');
      return;
    }

    for (const task of tasksToSchedule) {
      const data = scheduleData[task.id];
      if (!data.dueDate) {
        setError(`Please set a due date for "${task.title}"`);
        return;
      }
      if (!data.estimatedHours || data.estimatedHours < 0.5) {
        setError(`Please set valid estimated hours for "${task.title}"`);
        return;
      }
    }

    setLoading(true);

    try {
      const payload = tasksToSchedule.map(task => {
        const data = scheduleData[task.id];
        return {
          title: task.title,
          estimatedHours: data.estimatedHours,
          dueDate: data.dueDate,
          dependencies: data.dependencies,
        };
      });

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/api/v1/projects/${projectId}/schedule`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to schedule tasks');
      }

      setScheduleData({});
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule tasks');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 border border-slate-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="flex justify-between items-center p-6 border-b border-slate-800">
            <div>
              <Dialog.Title className="text-xl font-semibold text-white">
                Smart Schedule
              </Dialog.Title>
              <p className="text-sm text-slate-400 mt-1">Configure scheduling parameters for your tasks</p>
            </div>
            <Dialog.Close className="text-slate-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-slate-800/50 border border-slate-700 rounded-lg p-5"
                >
                  <h3 className="text-white font-medium mb-4">{task.title}</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="flex items-center space-x-2 text-sm font-medium text-slate-300 mb-2">
                        <Calendar className="w-4 h-4" />
                        <span>Due Date</span>
                      </label>
                      <input
                        type="date"
                        value={scheduleData[task.id]?.dueDate || ''}
                        onChange={(e) => updateTaskSchedule(task.id, 'dueDate', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="flex items-center space-x-2 text-sm font-medium text-slate-300 mb-2">
                        <Clock className="w-4 h-4" />
                        <span>Estimated Hours</span>
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="0.5"
                        value={scheduleData[task.id]?.estimatedHours || ''}
                        onChange={(e) => updateTaskSchedule(task.id, 'estimatedHours', parseFloat(e.target.value))}
                        placeholder="e.g., 4"
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {tasks.length > 1 && (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-3">
                        Dependencies
                      </label>
                      <div className="space-y-2">
                        {tasks
                          .filter(t => t.id !== task.id)
                          .map(dependencyTask => (
                            <label
                              key={dependencyTask.id}
                              className="flex items-center space-x-3 p-2 hover:bg-slate-800 rounded cursor-pointer"
                            >
                              <Checkbox.Root
                                checked={scheduleData[task.id]?.dependencies?.includes(dependencyTask.id) || false}
                                onCheckedChange={() => toggleDependency(task.id, dependencyTask.id)}
                                className="w-4 h-4 bg-slate-800 border-2 border-slate-700 rounded flex items-center justify-center hover:border-emerald-500 transition-colors"
                              >
                                <Checkbox.Indicator>
                                  <Check className="w-3 h-3 text-emerald-500" />
                                </Checkbox.Indicator>
                              </Checkbox.Root>
                              <span className="text-sm text-slate-300">{dependencyTask.title}</span>
                            </label>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {error && (
              <div className="px-6 pb-4">
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              </div>
            )}

            <div className="flex space-x-3 p-6 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                {loading ? 'Scheduling...' : 'Generate Schedule'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
