import { useState } from 'react';
import { Plus } from 'lucide-react';

interface TaskInputProps {
  onAdd: (description: string, details: string) => void;
  isLoading?: boolean;
}

export const TaskInput = ({ onAdd, isLoading }: TaskInputProps) => {
  const [description, setDescription] = useState('');
  const [details, setDetails] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim()) {
      onAdd(description.trim(), details.trim());
      setDescription('');
      setDetails('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Task title..."
        className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white placeholder-slate-500"
        disabled={isLoading}
      />
      <textarea
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        placeholder="Add details (optional)..."
        rows={3}
        className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white placeholder-slate-500 resize-none"
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={!description.trim() || isLoading}
        className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium"
      >
        <Plus className="w-5 h-5" />
        <span>Add Task</span>
      </button>
    </form>
  );
};
