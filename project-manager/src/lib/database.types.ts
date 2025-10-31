export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          createdAt: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          createdAt?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          createdAt?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          projectId: string;
          title: string;
          description: string | null;
          due_date: string | null;
          completed: boolean;
          createdAt: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          projectId: string;
          title: string;
          description?: string | null;
          due_date?: string | null;
          completed?: boolean;
          createdAt?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          projectId?: string;
          title?: string;
          description?: string | null;
          due_date?: string | null;
          completed?: boolean;
          createdAt?: string;
          updated_at?: string;
        };
      };
    };
  };
}
