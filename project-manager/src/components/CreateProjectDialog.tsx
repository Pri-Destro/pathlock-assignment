import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { projectSchema, type ProjectInput } from '../lib/schemas';
import { api } from '../services/api';
import { useToast } from './ToastProvider';


interface CreateProjectDialogProps {
  open: boolean;
  onClose: () => void;
  onProjectCreated: () => void;
}

export default function CreateProjectDialog({ open, onClose, onProjectCreated }: CreateProjectDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [createdAt, setCreatedAt] = useState(new Date());
  const [errors, setErrors] = useState<Partial<ProjectInput>>({});
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setCreatedAt(new Date ())
    const result = projectSchema.safeParse({
       title,
       description: description || null, 
       createdAt : createdAt.toISOString()  });

    if (!result.success) {
        const fieldErrors: Partial<ProjectInput> = {};
        result.error.issues.forEach((err) => {
        if (err.path && err.path.length) {
        const key = err.path[0] as keyof ProjectInput;
        fieldErrors[key] = err.message as never;
    }
    });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);



    try {

      if (!token) throw new Error('Not authenticated');

      await api.createProject(
      { title: result.data.title, description: result.data.description, createdAt: new Date (result.data.createdAt) },
      token
      );

      setTitle('');
      setDescription('');
      onProjectCreated();
      onClose();
    } catch (error) {
      console.error('Error creating project:', error);
      showToast('Failed to create project', 'error');
    } finally {
      setLoading(false);
    }
}

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 border border-slate-800 rounded-lg shadow-xl w-full max-w-md p-6">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-semibold text-white">
              Create New Project
            </Dialog.Title>
            <Dialog.Description className="text-sm text-slate-400 mt-1">
            </Dialog.Description>
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
                placeholder="My Awesome Project"
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
                rows={4}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                placeholder="Describe your project..."
              />
              {errors.description && <p className="mt-1.5 text-sm text-red-400">{errors.description}</p>}
              <p className="mt-1.5 text-xs text-slate-500">{description.length}/500 characters</p>
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
                {loading ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
