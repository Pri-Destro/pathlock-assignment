export interface Task {
  id: string;
  description: string;
  details: string;
  isCompleted: boolean;
}

export interface CreateTaskRequest {
  description: string;
  details?: string;
}

export interface UpdateTaskRequest {
  description: string;
  details?: string;
  isCompleted: boolean;
}

export type FilterType = 'all' | 'active' | 'completed';
