import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {type Database } from '../lib/database.types';
import { ArrowLeft, Plus, Trash2, Calendar, Sparkles, SquarePen } from 'lucide-react';
import * as Checkbox from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import CreateTaskDialog from '../components/CreateTaskDialog';
import SmartScheduleDialog from '../components/SmartScheduleDialog';
import EditTaskDialog from '../components/EditTaskDialog';
import {useToast} from '../components/ToastProvider'
import { format } from 'date-fns';
import { api } from '../services/api';

type Project = Database['public']['Tables']['projects']['Row'];
type Task = Database['public']['Tables']['tasks']['Row'];

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[] | []>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTaskDialog, setShowCreateTaskDialog] = useState(false);
  const [showSmartScheduleDialog, setShowSmartScheduleDialog] = useState(false);
  const [showEditTaskDialog, setShowEditTaskDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const {showToast} = useToast()
  const {token} = useAuth()

  useEffect(() => {
    if (id) {
      loadProjectAndTasks();
    }
  }, [id]);

  const loadProjectAndTasks = async () => {
    if (!id) return;

    try {
      if (!token) throw new Error('Not authenticated');

      const [projectData, tasksData] = await Promise.all([
        api.getProjectById(id, token),
        api.getTask(id, token)
      ]);

      if (!projectData) {
        navigate('/dashboard');
        return;
      }

      setProject(projectData);
      setTasks(tasksData || []);
    } catch (error) {
      console.error('Error loading project:', error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    try {

      if(!token) throw new Error('Not authenticated');
      await api.updateTask(taskId, { completed }, token);

      setTasks(tasks.map(t => t.id === taskId ? { ...t, completed } : t));
      if(completed) showToast("Task Completed!")

      setShowEditTaskDialog(false)

    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      if(!token) throw new Error("Not Authenticated")
      
      await api.deleteTask(taskId, token);

      setTasks(tasks.filter(t => t.id !== taskId));
      showToast("Task Deleted!")
      loadProjectAndTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleEditClick = (task: Task) => {
     setEditingTask(task);
     setShowEditTaskDialog(true);
   };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!project) return null;

  const completedTasks = tasks.filter(t => t.completed).length;

  return (
    <div className="min-h-screen bg-slate-950">
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 px-3 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Projects</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{project.title}</h1>
          {project.description && (
            <p className="text-slate-400">{project.description}</p>
          )}
          <div className="mt-4 flex items-center space-x-6 text-sm text-slate-500">
            <span>Created {format(new Date(project.createdAt), 'MMM d, yyyy')}</span>
            <span>{completedTasks} / {tasks.length} tasks completed</span>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Tasks</h2>
          <div className="flex space-x-3">
            {tasks.length > 0 && (
              <button
                onClick={() => setShowSmartScheduleDialog(true)}
                className="flex items-center space-x-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors border border-slate-700"
              >
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <span>Smart Schedule</span>
              </button>
            )}
            <button
              onClick={() => setShowCreateTaskDialog(true)}
              className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-lg font-medium text-slate-300 mb-2">No tasks yet</h3>
            <p className="text-slate-500 mb-6">Add your first task to get started</p>
            <button
              onClick={() => setShowCreateTaskDialog(true)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add Task</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-slate-900 border border-slate-800 rounded-lg p-4 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start space-x-4">
                  <Checkbox.Root
                    checked={task.completed}
                    onCheckedChange={(checked) => handleToggleTask(task.id, checked === true)}
                    className="w-5 h-5 bg-slate-800 border-2 border-slate-700 rounded flex items-center justify-center mt-0.5 hover:border-emerald-500 transition-colors"
                  >
                    <Checkbox.Indicator>
                      <Check className="w-4 h-4 text-emerald-500" />
                    </Checkbox.Indicator>
                  </Checkbox.Root>

                  <div className="flex-1 min-w-0">
                    <h3 className={`text-white font-medium ${task.completed ? 'line-through text-slate-500' : ''}`}>
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className={`mt-1 text-sm text-slate-400 ${task.completed ? 'line-through text-slate-500' : ''}`}>{task.description}</p>
                    )}
                    {task.due_date && (
                      <div className="mt-2 flex items-center space-x-2 text-xs text-slate-500">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Due {format(new Date(task.due_date), 'MMM d, yyyy')}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleEditClick(task)}
                    className="p-1.5 text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors mr-2"
                  >
                  <SquarePen className="w-4 h-4"/>  
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <CreateTaskDialog
        open={showCreateTaskDialog}
        onClose={() => setShowCreateTaskDialog(false)}
        projectId={id!}
        onTaskCreated={loadProjectAndTasks}
      />

      <EditTaskDialog
        open={showEditTaskDialog}
        onClose={() => {
          setShowEditTaskDialog(false);
          setEditingTask(null);
        }}
        task={editingTask}
        onTaskUpdated={loadProjectAndTasks}
      />

      <SmartScheduleDialog
        open={showSmartScheduleDialog}
        onClose={() => setShowSmartScheduleDialog(false)}
        projectId={id!}
        tasks={tasks}
        onScheduleComplete={(recommendedOrder) => {
            const taskMap = new Map(tasks.map(t => [t.id, t]));
            const sortedTasks = recommendedOrder
                .map(item => item.taskId ? taskMap.get(item.taskId.toString()) : undefined)
                .filter((task): task is Task => task !== undefined); // Type guard to remove undefined values
            setTasks(sortedTasks);
            }}
        />
    </div>
  );
}
