import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { TaskInput } from './components/TaskInput';
import { TaskList } from './components/TaskList';
import { TaskFilter } from './components/TaskFilter'
import { Progress } from './components/Progress'
import { getAllTasks, createTask, updateTask, deleteTask } from './helper/service';
import { Hero } from "./components/Hero"
import type { Task, FilterType } from './types/task';
import { checkBackend } from './helper/service';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBackendReady, setIsBackendReady] = useState(false);

    useEffect(() => {
    const init = async () => {
      try {
        await checkBackend();
        setIsBackendReady(true);
        await loadTasks();
      } catch (err) {
        setError('Connecting to backend...');
        const interval = setInterval(async () => {
          try {
            await checkBackend();
            clearInterval(interval);
            setIsBackendReady(true);
            setError(null);
            await loadTasks();
          } catch {
            setError('Connecting to backend...');
          }
        }, 3000);
      }
    };
    init();
  }, []);


  useEffect(() => {
    loadTasks();
  }, []);


  const loadTasks = async () => {
    try {
      setError(null);
      const data = await getAllTasks();
      setTasks(data);
    } catch (err) {
      setError('Failed to load tasks. Make sure the backend is running on http://localhost:5000');
      console.error('Error loading tasks:', err);
    }
  };

  const handleAddTask = async (description: string, details: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const newTask = await createTask({ description, details });
      setTasks([...tasks, newTask]);
    } catch (err) {
      setError('Failed to add task');
      console.error('Error adding task:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleComplete = async (id: string, isCompleted: boolean) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    try {
      setError(null);
      const updatedTask = await updateTask(id, {
        description: task.description,
        details: task.details,
        isCompleted,
      });
      setTasks(tasks.map((t) => (t.id === id ? updatedTask : t)));
    } catch (err) {
      setError('Failed to update task');
      console.error('Error updating task:', err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      setError(null);
      await deleteTask(id);
      setTasks(tasks.filter((t) => t.id !== id));
    } catch (err) {
      setError('Failed to delete task');
      console.error('Error deleting task:', err);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'active') return !task.isCompleted;
    if (filter === 'completed') return task.isCompleted;
    return true;
  });

  const taskCounts = {
    all: tasks.length,
    active: tasks.filter((t) => !t.isCompleted).length,
    completed: tasks.filter((t) => t.isCompleted).length,
  };

  if (!isBackendReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200 text-lg">
        Connecting to backend...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-8 sm:py-12">

        <Hero/>

        <div className="max-w-6xl mx-auto">
          <div className="space-y-6">
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-800 p-8 flex items-center justify-center">
              <Progress
                completed={taskCounts.completed}
                total={taskCounts.all}
              />
            </div>

            <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-800 p-6 sm:p-8 space-y-6">
              {error && (
                <div className="flex items-center gap-3 p-4 bg-rose-900/20 border border-rose-800/50 rounded-lg text-rose-400">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <TaskInput onAdd={handleAddTask} isLoading={isLoading} />

              <TaskFilter
                currentFilter={filter}
                onFilterChange={setFilter}
                taskCounts={taskCounts}
              />

              <div className="pt-4">
                <TaskList
                  tasks={filteredTasks}
                  onToggleComplete={handleToggleComplete}
                  onDelete={handleDeleteTask}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
