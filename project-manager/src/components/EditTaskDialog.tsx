import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useAuth } from '../contexts/AuthContext';
import {useToast} from './ToastProvider';
import { X } from 'lucide-react';
import { api } from '../services/api';

interface EditTaskDialogProps {
  open: boolean;
  onClose: () => void;
  task: {
    id: string;
    title: string;
    description?: string | null;
    due_date?: string | null;
  } | null;
  onTaskUpdated: () => void;
}

export default function EditTaskDialog({ open, onClose, task, onTaskUpdated }: EditTaskDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const { token } = useAuth();

  useEffect(() => {
    if (task) {
      setTitle(task.title ?? '');
      setDescription(task.description ?? '');
      setDueDate(task.due_date ?? '');
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(e)
    if (!task) return;
    console.log(task,"it is task to be updated")
    setLoading(true);
    try {
      if (!token) throw new Error('Not authenticated');

      const payload = {
        title,
        description: description === '' ? null : description,
        due_date: dueDate === '' ? null : dueDate,
      };

      console.log(payload, " payload to send")
      await api.updateTask(task.id, payload, token);
      onTaskUpdated();
      showToast("Task Updated!!")
      onClose();
    } catch (err) {
      console.error('Error updating task:', err);
      showToast("Error updating task..")
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 border border-slate-800 rounded-lg shadow-xl w-full max-w-md p-6">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-semibold text-white">Edit Task</Dialog.Title>
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
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">Description</label>
              <textarea
                id="description"
                value={description ?? ''}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                placeholder="Task details..."
              />
            </div>

            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-slate-300 mb-2">Due Date</label>
              <input
                id="dueDate"
                type="date"
                value={dueDate ?? ''}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div className="flex space-x-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors">Cancel</button>
              <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors">{loading ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
