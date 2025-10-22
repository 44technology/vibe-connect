export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'pm' | 'client';
  password?: string; // For authentication
  created_at: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  created_at: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  position: string;
  created_at: string;
}

export interface ProjectStep {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'finished';
  assigned_employee_id?: string;
  order_index: number;
  start_date?: string;
  end_date?: string;
  created_at: string;
  parent_step_id?: string; // For child steps
  child_steps?: ProjectStep[]; // For parent steps
  step_type: 'parent' | 'child';
  notes?: string; // For PM notes on parent steps
  budget_percentage?: number; // Percentage of total project budget
}

export interface ProjectComment {
  id: string;
  project_id: string;
  user_id: string;
  user_name: string;
  comment: string;
  created_at: string;
}

export interface ProjectManager {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'pm';
  created_at: string;
}

export interface ProjectSchedule {
  id: string;
  project_id: string;
  pm_id: string;
  pm_name: string;
  assigned_date: string;
  deadline: string;
  status: 'pending' | 'in_progress' | 'completed';
  created_at: string;
}

export interface PMSchedule {
  id: string;
  pm_id: string;
  pm_name: string;
  title: string;
  description?: string;
  date: string;
  start_time: string;
  end_time: string;
  location?: string;
  status: 'pending' | 'in_progress' | 'completed';
  project_id?: string; // Optional - can be general task
  project_name?: string;
  created_at: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  start_date: string;
  deadline: string;
  status: 'active' | 'completed' | 'archived';
  client_id: string; // Required - every project must have a client
  client_name: string; // For display purposes
  manager_id: string;
  assigned_pms?: string[]; // Array of PM IDs
  progress_percentage: number;
  created_at: string;
  steps?: ProjectStep[];
  comments?: ProjectComment[];
  schedules?: ProjectSchedule[];
}

export interface EmployeeSchedule {
  id: string;
  employee_id: string;
  project_id: string;
  step_id: string;
  assigned_date: string;
  deadline: string;
  status: 'pending' | 'ongoing' | 'completed';
}

export interface MaterialRequest {
  id: string;
  project_id: string;
  project_name: string;
  substep_id: string;
  substep_name: string;
  quantity: string;
  description: string;
  delivery_date: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_by: string;
  requested_at: string;
}

export type Language = 'en' | 'es';