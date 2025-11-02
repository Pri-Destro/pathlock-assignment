import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { type Database } from '../lib/database.types';
import { Plus, LogOut, FolderOpen, Trash2 } from 'lucide-react';
import CreateProjectDialog from '../components/CreateProjectDialog';
import { useToast } from '../components/ToastProvider';
import { format } from 'date-fns';

type Project = Database['public']['Tables']['projects']['Row'];

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const {token} = useAuth();
  const { showToast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      
      if(!token) throw new Error("Not Authenticated")
      const data  = await api.getProjects(token)
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? All tasks will be deleted.')) {
      return;
    }

    try {
      if(!token ) throw new Error("Not Authenticated")

      await api.deleteProject(projectId, token)
      setProjects(projects.filter(p => p.id !== projectId));
    } catch (error) {
      console.error('Error deleting project:', error);
      showToast('Failed to delete project', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-emerald-500" />
              </div>
              <h1 className="text-xl font-semibold text-white">Project Manager</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-400">{user?.email}</span>
              <button
                onClick={() => signOut()}
                className="flex items-center space-x-2 px-3 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white">Projects</h2>
            <p className="mt-1 text-slate-400">Manage your projects and tasks</p>
          </div>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>New Project</span>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-lg font-medium text-slate-300 mb-2">No projects yet</h3>
            <p className="text-slate-500 mb-6">Create your first project to get started</p>
            <button
              onClick={() => setShowCreateDialog(true)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Create Project</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-emerald-500/50 transition-colors group"
              >
                <div className="flex justify-between items-start mb-4">
                  <Link to={`/projects/${project.id}`} className="flex-1">
                    <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors">
                      {project.title}
                    </h3>
                  </Link>
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                    title="Delete project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {project.description && (
                  <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                    {project.description}
                  </p>
                )}
                <div className="text-xs text-slate-500">
                  Created {format(new Date(project.createdAt), 'MMM d, yyyy')}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <CreateProjectDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onProjectCreated={loadProjects}
      />
    </div>
  );
}
