export type Priority = 'High' | 'Medium' | 'Low';
export type Status = 'To Do' | 'In Progress' | 'Done' | 'Archived';

export interface Task {
  id: string;
  title: string;
  description: string;
  link: string;
  priority: Priority;
  status: Status;
  dueDate: string;
  labels: string[];
  project: string;
  reminderDate: string;
  assignedTo: string;
  assignedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DropdownItem {
  id: string;
  name: string;
}

export type DropdownKind = 'projects' | 'labels' | 'users';

export interface BootstrapResponse {
  tasks: Task[];
  projects: DropdownItem[];
  labels: DropdownItem[];
  users: DropdownItem[];
  statuses: Status[];
  priorities: Priority[];
}

export interface TaskInput {
  title: string;
  description?: string;
  link?: string;
  priority?: Priority;
  status?: Status;
  dueDate?: string;
  labels?: string[];
  project?: string;
  reminderDate?: string;
  assignedTo?: string;
  assignedBy?: string;
}

export const STATUSES: Status[] = ['To Do', 'In Progress', 'Done', 'Archived'];
export const PRIORITIES: Priority[] = ['High', 'Medium', 'Low'];

export const SHEETS = {
  tasks: 'TaskManagement',
  projects: 'DD_Projects',
  labels: 'DD_Labels',
  users: 'DD_Users',
} as const;

export const TASK_HEADERS = [
  'id', 'title', 'description', 'link',
  'priority', 'status', 'dueDate', 'labels',
  'project', 'reminderDate', 'assignedTo', 'assignedBy',
  'createdAt', 'updatedAt',
] as const;

export const DROPDOWN_HEADERS = ['id', 'name'] as const;
