export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'pm' | 'client' | 'sales';
  password?: string; // For authentication
  profile_picture?: string; // Profile picture URL
  created_at: string;
}

export interface LeadNote {
  id: string;
  note: string;
  created_at: string;
  created_by: string;
  created_by_name: string;
  contact_date?: string; // When we contacted them
}

export interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  notes: LeadNote[];
  status: 'new' | 'qualified' | 'converted' | 'lost';
  assigned_to?: string; // Sales person ID
  assigned_to_name?: string; // Sales person name
  converted_to_client_id?: string; // If converted to client
  created_at: string;
  updated_at: string;
  created_by: string;
  created_by_name: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string; // Keep for backward compatibility but not used
  address?: string; // Keep for backward compatibility but not used
  notes?: ClientNote[]; // Notes and communications
  converted_from_lead_id?: string; // If converted from lead
  created_at: string;
}

export interface ClientNote {
  id: string;
  note: string;
  created_at: string;
  created_by: string;
  created_by_name: string;
  contact_date?: string; // When we contacted them
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  sender_name: string;
  message: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  file_url?: string;
  file_name?: string;
  file_size?: number;
  created_at: string;
  updated_at?: string;
  read_by?: { [userId: string]: string }; // userId -> timestamp
  is_edited?: boolean;
}

export interface Chat {
  id: string;
  type: 'direct' | 'group' | 'project'; // direct: 1-1, group: multiple users, project: project-related
  name?: string; // For group chats
  project_id?: string; // If project-related
  participants: string[]; // User IDs
  participant_names?: { [userId: string]: string }; // userId -> name
  last_message?: string;
  last_message_time?: string;
  last_message_sender?: string;
  unread_count?: { [userId: string]: number }; // userId -> count
  created_at: string;
  updated_at?: string;
  created_by: string;
  is_archived?: { [userId: string]: boolean }; // userId -> archived status
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  position: string;
  jobTitle?: string; // CEO, Owner, Manager, etc.
  profile_picture?: string;
  created_at: string;
  daily_rate?: number; // Daily rate for payroll (admin only)
  pay_type?: 'daily' | 'salary'; // How this employee is paid
  salary?: number; // Salary amount (admin only)
}

export interface SubContractor {
  id: string;
  name: string;
  phone: string;
  email: string;
  trade: string; // Plumbing, Electrician, etc.
  created_at: string;
}

export interface Vendor {
  id: string;
  companyName: string;
  repName: string;
  phone: string;
  email: string;
  created_at: string;
}

export interface Comment {
  id: string;
  project_id?: string;
  proposal_id?: string;
  invoice_id?: string;
  change_order_id?: string;
  material_request_id?: string;
  user_id: string;
  user_name: string;
  comment: string;
  created_at: string;
  updated_at?: string;
}

export interface TimeClockEntry {
  id: string;
  user_id: string;
  user_name: string;
  user_role: 'pm' | 'sales' | 'office';
  clock_in: string; // ISO timestamp
  clock_out?: string; // ISO timestamp, null if still clocked in
  date: string; // YYYY-MM-DD format
  total_hours?: number; // Calculated total hours
  status: 'clocked_in' | 'clocked_out';
  created_at: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string; // Reverse geocoded address
  };
  clock_out_location?: {
    latitude: number;
    longitude: number;
    address?: string; // Reverse geocoded address
  };
}

export interface WeeklyTimeClock {
  week_start: string; // Monday date YYYY-MM-DD
  week_end: string; // Sunday date YYYY-MM-DD
  entries: TimeClockEntry[];
  total_hours: number;
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
  manual_checkmark?: boolean; // Manual checkmark toggle for child steps
  price?: number; // Price for parent steps (admin/PM only)
  profit_rate?: number; // Company profit % for this work title (if set, overrides project gross_profit_rate)
  sub_contractor_price?: number; // Sub contractor price for parent steps
  sub_contractor_id?: string; // Sub contractor ID
  sub_contractor_name?: string; // Sub contractor name
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
  start_date: string;
  end_date: string;
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
  status: 'pending' | 'under_review' | 'approved' | 'active' | 'completed' | 'archived' | 'rejected';
  client_id: string; // Required - every project must have a client (first client for backward compatibility)
  client_name: string; // For display purposes (first client name for backward compatibility)
  client_ids?: string[]; // Array of client IDs (multiple clients support)
  client_names?: string[]; // Array of client names (multiple clients support)
  manager_id: string;
  assigned_pms?: string[]; // Array of PM IDs
  progress_percentage: number;
  project_address?: string; // Full address string for backward compatibility
  project_street?: string; // Street address
  project_city?: string; // City
  project_state?: string; // State
  project_zip?: string; // ZIP code
  discount?: number; // Discount amount
  project_description?: string; // Additional project description/notes
  created_at: string;
  // Approval fields
  created_by: string; // Sales or Admin who created
  created_by_name: string;
  approved_by?: string; // Admin who approved
  approved_by_name?: string;
  approved_at?: string;
  rejected_by?: string; // Admin who rejected
  rejected_by_name?: string;
  rejected_at?: string;
  rejection_reason?: string;
  total_budget?: number; // Internal project budget (real costs, for admin/PM only)
  client_budget?: number; // Client-facing budget (from proposal, shown to client)
  pm_budgets?: { [pmId: string]: number }; // Budget allocated to each PM
  gross_profit_rate?: number; // Company profit % (PM budget is 100 - this)
  proposal_id?: string; // Optional - link to proposal if created from proposal
  // Job creation
  is_job: boolean; // True when approved and assigned to PMs
  steps?: ProjectStep[];
  comments?: ProjectComment[];
  schedules?: ProjectSchedule[];
  // Change request fields (used in approval flow)
  change_request_by?: string;
  change_request_by_name?: string;
  change_request_at?: string;
  change_request_reason?: string;
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
  item_name?: string;
  unit?: string;
  vendor_id?: string;
  delivery_date: string;
  sub_contractor?: string; // Optional sub-contractor field
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  requested_by: string;
  requested_at: string;
  change_request_by?: string;
  change_request_by_name?: string;
  change_request_at?: string;
  change_request_reason?: string;
  approved_at?: string;
  rejected_at?: string;
  approved_by?: string;
  rejected_by?: string;
  rejection_reason?: string;
  purchase_status?: 'pending' | 'ordered' | 'shipped' | 'delivered';
  purchase_date?: string;
  shipping_date?: string;
  delivery_date_actual?: string;
}

export interface ChangeOrderRequest {
  id: string;
  project_id: string;
  project_name: string;
  title: string;
  description: string;
  requested_date: string;
  requested_by: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  completion_status?: 'pending' | 'in_progress' | 'finished'; // For approved change orders - independent from project timeline
  steps: ProjectStep[];
  created_at: string;
  approved_at?: string;
  rejected_at?: string;
  approved_by?: string;
  rejected_by?: string;
  rejection_reason?: string;
  change_request_by?: string;
  change_request_by_name?: string;
  change_request_at?: string;
  change_request_reason?: string;
}

export type Language = 'en' | 'es';

export interface Proposal {
  id: string;
  proposal_number: string;
  client_id?: string; // Optional - can use client_name and client_email instead
  client_name: string; // Required - can be existing client or new client name
  client_email?: string; // Optional - for new clients
  client_address: string; // Required - client address (full address string for backward compatibility)
  client_street?: string; // Street address
  client_city?: string; // City
  client_state?: string; // State
  client_zip?: string; // ZIP code
  category: string; // Required - Residential or Commercial
  work_titles: Array<{ 
    name: string; 
    descriptions?: string[]; // Array of descriptions (up to 5 per work title)
    description?: string; // Legacy support - single description for backward compatibility
    quantity: number;
    unit?: string; // Optional - removed from form
    unit_price: number;
    price: number;
  }>;
  general_conditions: number;
  supervision_fee: number;
  discount?: number; // Discount amount
  description?: string; // Proposal description/notes
  total_cost: number;
  management_approval: 'pending' | 'approved' | 'rejected';
  client_approval: null | 'pending' | 'approved' | 'rejected' | 'request_changes'; // null = not sent to client yet
  management_approved_at?: string;
  management_rejected_at?: string;
  management_approved_by?: string;
  management_rejected_by?: string;
  management_rejection_reason?: string;
  client_approved_at?: string;
  client_rejected_at?: string;
  client_rejection_reason?: string;
  client_change_request_reason?: string; // Reason for change request
  // Change request fields (used in approval flow)
  change_request_by?: string;
  change_request_by_name?: string;
  change_request_reason?: string;
  created_by: string;
  created_by_name: string;
  created_at: string;
  proposal_date: string; // Date when proposal was created
}

export interface Invoice {
  id: string;
  project_id?: string; // Optional - for estimate invoices
  project_name?: string; // Optional
  proposal_id?: string; // Optional - link to proposal if created from proposal
  invoice_number: string;
  client_id?: string; // Optional - can use client_name and client_email instead
  client_name: string; // Required - can be existing client or new client name
  client_email?: string; // Optional - for new clients
  client_address?: string; // Optional - client address
  work_titles: Array<{ 
    name: string; 
    description?: string; 
    quantity: number;
    unit?: string; // Optional - removed from form
    unit_price: number;
    price: number;
  }>;
  general_conditions: number;
  supervision_fee: number;
  total_cost: number;
  status: 'pending' | 'paid' | 'overdue' | 'partial-paid' | 'cancelled';
  paid_amount?: number; // Amount paid for partial-paid invoices
  payments?: ExpensePayment[]; // Payment history
  total_paid?: number; // Total amount paid so far
  created_by: string;
  created_by_name: string;
  created_at: string;
  invoice_date: string; // Date when invoice was created
  due_date?: string; // Due date for payment
  approved_at?: string;
  rejected_at?: string;
  approved_by?: string;
  rejected_by?: string;
  rejection_reason?: string;
  client_approved?: boolean; // Client approval checkbox
  client_approved_at?: string; // When client approved
  client_approved_by?: string; // Client user ID who approved
  client_approved_by_name?: string; // Client user name who approved
}

export interface ExpenseDocument {
  id: string;
  name: string;
  file_url: string;
  file_type: 'image' | 'document';
  file_size?: number;
  uploaded_at: string;
  uploaded_by: string;
  uploaded_by_name: string;
}

export interface ExpensePayment {
  id: string;
  amount: number;
  payment_date: string;
  payment_method: 'check' | 'wire' | 'ach' | 'credit_card' | 'cash' | 'other';
  check_number?: string;
  reference_number?: string;
  paid_by: string;
  paid_by_name: string;
  notes?: string;
  created_at: string;
  documents?: ExpenseDocument[]; // Documents for payment (receipts, etc.)
}

export interface Expense {
  id: string;
  type: 'subcontractor' | 'material' | 'office' | 'project' | 'other';
  category?: string; // For office: 'book', 'stationery', 'kitchen', etc. For project: 'toll', 'parking', 'permit', etc.
  amount: number;
  description: string;
  invoice_number?: string; // Invoice/Reference number from subcontractor or vendor
  project_id?: string; // If assigned to a project
  project_name?: string;
  step_id?: string; // Work title (step) ID if assigned to a specific work title
  step_name?: string; // Work title (step) name if assigned to a specific work title
  is_office: boolean; // true if office expense, false if project expense
  vendor_id?: string; // For material purchases
  vendor_name?: string;
  subcontractor_id?: string; // For subcontractor payments
  subcontractor_name?: string;
  material_request_id?: string; // Link to material request if applicable
  date: string; // Expense date
  receipt_url?: string; // Receipt/invoice image URL (deprecated, use documents array)
  documents?: ExpenseDocument[]; // Array of documents (receipts, invoices, etc.)
  status: 'pending' | 'approved' | 'rejected' | 'paid' | 'partially_paid'; // Approval and payment status
  approved_by?: string; // User ID who approved
  approved_by_name?: string;
  approved_at?: string;
  rejected_by?: string; // User ID who rejected
  rejected_by_name?: string;
  rejected_at?: string;
  rejection_reason?: string;
  payments?: ExpensePayment[]; // Payment history
  total_paid?: number; // Total amount paid so far
  created_by: string;
  created_by_name: string;
  created_at: string;
  updated_at?: string;
}

export interface TodoChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  completed_by?: string;
  completed_by_name?: string;
  completed_at?: string;
}

export interface TodoComment {
  id: string;
  user_id: string;
  user_name: string;
  comment: string;
  created_at: string;
}

export interface TodoImage {
  id: string;
  url: string;
  thumbnail_url?: string;
  uploaded_by: string;
  uploaded_by_name: string;
  uploaded_at: string;
  drawing_data?: string; // SVG path data for drawings
}

export interface TodoItem {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  images?: TodoImage[];
  comments?: TodoComment[];
  checklist?: TodoChecklistItem[];
  status: 'pending' | 'in_progress' | 'completed';
  completed_by?: string;
  completed_by_name?: string;
  completed_at?: string;
  created_by: string;
  created_by_name: string;
  created_at: string;
  updated_at?: string;
  order_index?: number; // For sorting
}