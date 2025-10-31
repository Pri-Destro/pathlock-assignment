import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { taskSchema, type TaskInput } from '../lib/schemas';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

interface CreateTaskDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  onTaskCreated: () => void;
}

export default function CreateTaskDialog({ open, onClose, projectId, onTaskCreated }: CreateTaskDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [errors, setErrors] = useState<Partial<TaskInput>>({});
  const [loading, setLoading] = useState(false);
  const {token } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = taskSchema.safeParse({
      title,
      description: description || null,
      due_date: dueDate || null,
    });

    if (!result.success) {
      const fieldErrors: Partial<TaskInput> = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0];
        if (typeof key === 'string') {
          fieldErrors[key as keyof TaskInput] = issue.message as never;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      
      if(!token) throw new Error("Not Authenticated")

      await api.addTask(projectId,{
        title: result.data.title,
        description: result.data.description,
        due_date: result.data.due_date,
      }, token)

      setTitle('');
      setDescription('');
      setDueDate('');
      onTaskCreated();
      onClose();
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 border border-slate-800 rounded-lg shadow-xl w-full max-w-md p-6">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-semibold text-white">
              Add New Task
            </Dialog.Title>
            <Dialog.Close className="text-slate-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Task title"
              />
              {errors.title && <p className="mt-1.5 text-sm text-red-400">{errors.title}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                placeholder="Task details..."
              />
              {errors.description && <p className="mt-1.5 text-sm text-red-400">{errors.description}</p>}
            </div>

            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-slate-300 mb-2">
                Due Date
              </label>
              <input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              {errors.due_date && <p className="mt-1.5 text-sm text-red-400">{errors.due_date}</p>}
            </div>

            <div className="flex space-x-3 pt-2">
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
                {loading ? 'Adding...' : 'Add Task'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
