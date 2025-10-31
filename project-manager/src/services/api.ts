const API_URL = import.meta.env.VITE_API_BASE_URL;

async function request(
  endpoint: string,
  method: string = 'GET',
  body?: any,
  token?: string
) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed (${res.status})`);
  }

  return res.json();
}

/* ========== AUTH ========== */
export const api = {
    register: (email: string, name : string, password: string) =>
        request('/api/auth/register', 'POST', { email, name, password }),

    login: (email: string, password: string) =>
        request('/api/auth/login', 'POST', { email, password }),

    /* ========== PROJECTS ========== */
    getProjects: (token: string) =>
        request('/api/projects', 'GET', undefined, token),

    getProjectById: (id: string, token: string) =>
        request(`/api/projects/${id}`, 'GET', undefined, token),

    createProject: (
        data: { title: string; description?: string },
        token: string
    ) => request('/api/projects', 'POST', data, token),

    deleteProject: (id: string, token: string) =>
        request(`/api/projects/${id}`, 'DELETE', undefined, token),

    /* ========== TASKS ========== */

    getTask: (projectId: string, token: string) =>
        request(`/api/projects/${projectId}/tasks`, 'GET', token),

    addTask: (projectId: string, data: any, token: string) =>
        request(`/api/projects/${projectId}/tasks`, 'POST', data, token),

    updateTask: (taskId: string, data: any, token: string) =>
        request(`/api/tasks/${taskId}`, 'PUT', data, token),

    deleteTask: (taskId: string, token: string) =>
        request(`/api/tasks/${taskId}`, 'DELETE', undefined, token),
    };
