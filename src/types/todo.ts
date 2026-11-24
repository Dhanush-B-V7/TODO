export type Priority = 'low' | 'medium' | 'high';

export type ListColor = 'blue' | 'emerald' | 'amber' | 'violet' | 'rose' | 'teal';

export type SmartView = 'inbox' | 'today' | 'upcoming' | 'completed';

export type StatusFilter = 'all' | 'active' | 'completed';

export type SortOption = 'created' | 'dueDate' | 'priority';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  notes: string;
  completed: boolean;
  priority: Priority;
  dueDate: string | null; // YYYY-MM-DD
  listId: string;
  subtasks: Subtask[];
  createdAt: string; // ISO string
  completedAt: string | null;
}

export interface TaskList {
  id: string;
  name: string;
  color: ListColor;
}

export interface WorkspaceState {
  tasks: Task[];
  lists: TaskList[];
}

export interface FilterCriteria {
  view: SmartView | string; // SmartView or custom listId prefixed with `list:`
  status: StatusFilter;
  priority: Priority | 'all';
  search: string;
  sort: SortOption;
}

export interface OverviewMetrics {
  totalTasks: number;
  activeTasks: number;
  completedTasks: number;
  dueTodayTasks: number;
  overdueTasks: number;
  completionPercent: number;
}
