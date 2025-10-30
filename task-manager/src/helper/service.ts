import axios from 'axios';
import type { Task, CreateTaskRequest, UpdateTaskRequest } from '../types/task';

const url = import.meta.env.API_BASE_URL;

export const getAllTasks = async () => {
  const response = await axios.get<Task[]>(`${url}/tasks`);
  return response.data;
};

export const createTask = async (request: CreateTaskRequest) => {
  const response = await axios.post<Task>(`${url}/tasks`, request);
  return response.data;
};

export const updateTask = async (id: string, request: UpdateTaskRequest) => {
  const response = await axios.put<Task>(`${url}/tasks/${id}`, request);
  return response.data;
};

export const deleteTask = async (id: string) => {
  await axios.delete(`${url}/tasks/${id}`);
};