import type {
  FilterCriteria,
  ListColor,
  OverviewMetrics,
  Priority,
  Subtask,
  Task,
  TaskList,
  WorkspaceState,
} from '../types/todo';

export const LIST_COLORS: ListColor[] = [
  'blue',
  'emerald',
  'violet',
  'amber',
  'rose',
  'teal',
];

export const DEFAULT_LISTS: TaskList[] = [
  { id: 'personal', name: 'Personal', color: 'blue' },
  { id: 'engineering', name: 'Engineering', color: 'emerald' },
  { id: 'launch', name: 'Launch', color: 'violet' },
];

export function getLocalDateISO(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDaysISO(baseDateISO: string, days: number): string {
  const [y, m, d] = baseDateISO.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return getLocalDateISO(dt);
}

export function createSeedWorkspace(todayISO: string = getLocalDateISO()): WorkspaceState {
  const tomorrowISO = addDaysISO(todayISO, 1);
  const nextWeekISO = addDaysISO(todayISO, 4);
  const yesterdayISO = addDaysISO(todayISO, -1);

  return {
    lists: DEFAULT_LISTS,
    tasks: [
      {
        id: 'task-seed-1',
        title: 'Push repository to GitHub main branch',
        notes: 'Verify README instructions, clean gitignore, and ensure environment example has no secrets.',
        completed: false,
        priority: 'high',
        dueDate: todayISO,
        listId: 'launch',
        subtasks: [
          { id: 'sub-1', title: 'Run unit tests and typecheck', completed: true },
          { id: 'sub-2', title: 'Create remote repository on GitHub', completed: false },
          { id: 'sub-3', title: 'Push initial commit to main', completed: false },
        ],
        createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
        completedAt: null,
      },
      {
        id: 'task-seed-2',
        title: 'Import project in Vercel and verify SPA routes',
        notes: 'Confirm vercel.json rewrites handle direct refreshes cleanly.',
        completed: false,
        priority: 'high',
        dueDate: tomorrowISO,
        listId: 'launch',
        subtasks: [
          { id: 'sub-4', title: 'Check build output in dist/', completed: false },
          { id: 'sub-5', title: 'Test preview deployment URL', completed: false },
        ],
        createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        completedAt: null,
      },
      {
        id: 'task-seed-3',
        title: 'Review keyboard accessibility and focus states',
        notes: 'Tab through quick-add, task checkboxes, and modal controls.',
        completed: false,
        priority: 'medium',
        dueDate: todayISO,
        listId: 'engineering',
        subtasks: [],
        createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
        completedAt: null,
      },
      {
        id: 'task-seed-4',
        title: 'Renew domain SSL and DNS records',
        notes: 'Point custom CNAME record to cname.vercel-dns.com.',
        completed: false,
        priority: 'medium',
        dueDate: yesterdayISO,
        listId: 'engineering',
        subtasks: [],
        createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
        completedAt: null,
      },
      {
        id: 'task-seed-5',
        title: 'Plan weekly deep work blocks',
        notes: 'Reserve Tuesday and Thursday mornings for uninterrupted coding.',
        completed: false,
        priority: 'low',
        dueDate: nextWeekISO,
        listId: 'personal',
        subtasks: [],
        createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        completedAt: null,
      },
      {
        id: 'task-seed-6',
        title: 'Set up Vite + Tailwind CSS v4 starter',
        notes: 'Configured typography tokens and dark mode variant.',
        completed: true,
        priority: 'low',
        dueDate: yesterdayISO,
        listId: 'engineering',
        subtasks: [],
        createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
        completedAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
      },
    ],
  };
}

export function isTaskOverdue(task: Task, todayISO: string = getLocalDateISO()): boolean {
  if (task.completed || !task.dueDate) return false;
  return task.dueDate < todayISO;
}

export function isTaskDueToday(task: Task, todayISO: string = getLocalDateISO()): boolean {
  if (task.completed || !task.dueDate) return false;
  return task.dueDate <= todayISO;
}

export function formatDueDateLabel(
  dueDate: string | null,
  todayISO: string = getLocalDateISO(),
  completed: boolean = false
): { label: string; isOverdue: boolean; isToday: boolean } | null {
  if (!dueDate) return null;
  const tomorrowISO = addDaysISO(todayISO, 1);
  const yesterdayISO = addDaysISO(todayISO, -1);

  if (dueDate === todayISO) {
    return { label: 'Today', isOverdue: false, isToday: true };
  }
  if (dueDate === tomorrowISO) {
    return { label: 'Tomorrow', isOverdue: false, isToday: false };
  }
  if (dueDate === yesterdayISO) {
    return {
      label: completed ? 'Yesterday' : 'Yesterday (Overdue)',
      isOverdue: !completed,
      isToday: false,
    };
  }

  const [y, m, d] = dueDate.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  const formatted = dt.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  if (dueDate < todayISO && !completed) {
    return { label: `${formatted} (Overdue)`, isOverdue: true, isToday: false };
  }

  return { label: formatted, isOverdue: false, isToday: false };
}

const PRIORITY_RANK: Record<Priority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

export function filterAndSortTasks(
  tasks: Task[],
  criteria: FilterCriteria,
  todayISO: string = getLocalDateISO()
): Task[] {
  const query = criteria.search.trim().toLowerCase();

  const filtered = tasks.filter((task) => {
    if (criteria.view === 'today') {
      if (!isTaskDueToday(task, todayISO)) return false;
    } else if (criteria.view === 'upcoming') {
      if (task.completed || !task.dueDate || task.dueDate <= todayISO) return false;
    } else if (criteria.view === 'completed') {
      if (!task.completed) return false;
    } else if (criteria.view.startsWith('list:')) {
      const targetListId = criteria.view.slice(5);
      if (task.listId !== targetListId) return false;
    }

    if (criteria.view !== 'completed') {
      if (criteria.status === 'active' && task.completed) return false;
      if (criteria.status === 'completed' && !task.completed) return false;
    }

    if (criteria.priority !== 'all' && task.priority !== criteria.priority) {
      return false;
    }

    if (query) {
      const matchesTitle = task.title.toLowerCase().includes(query);
      const matchesNotes = task.notes.toLowerCase().includes(query);
      const matchesSubtask = task.subtasks.some((s) =>
        s.title.toLowerCase().includes(query)
      );
      if (!matchesTitle && !matchesNotes && !matchesSubtask) return false;
    }

    return true;
  });

  return [...filtered].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }

    if (criteria.sort === 'priority') {
      const diff = PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority];
      if (diff !== 0) return diff;
    } else if (criteria.sort === 'dueDate') {
      if (a.dueDate && b.dueDate && a.dueDate !== b.dueDate) {
        return a.dueDate.localeCompare(b.dueDate);
      }
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;
    }

    return b.createdAt.localeCompare(a.createdAt);
  });
}

export interface WorkspaceCounts {
  inboxActive: number;
  todayActive: number;
  upcomingActive: number;
  completedTotal: number;
  byListActive: Record<string, number>;
}

export function computeWorkspaceCounts(
  tasks: Task[],
  lists: TaskList[],
  todayISO: string = getLocalDateISO()
): WorkspaceCounts {
  const byListActive: Record<string, number> = {};
  for (const list of lists) {
    byListActive[list.id] = 0;
  }

  let inboxActive = 0;
  let todayActive = 0;
  let upcomingActive = 0;
  let completedTotal = 0;

  for (const task of tasks) {
    if (task.completed) {
      completedTotal += 1;
      continue;
    }

    inboxActive += 1;
    if (isTaskDueToday(task, todayISO)) {
      todayActive += 1;
    }
    if (task.dueDate && task.dueDate > todayISO) {
      upcomingActive += 1;
    }
    byListActive[task.listId] = (byListActive[task.listId] ?? 0) + 1;
  }

  return {
    inboxActive,
    todayActive,
    upcomingActive,
    completedTotal,
    byListActive,
  };
}

export function computeOverviewMetrics(
  tasks: Task[],
  todayISO: string = getLocalDateISO()
): OverviewMetrics {
  const totalTasks = tasks.length;
  let completedTasks = 0;
  let activeTasks = 0;
  let dueTodayTasks = 0;
  let overdueTasks = 0;

  for (const task of tasks) {
    if (task.completed) {
      completedTasks += 1;
    } else {
      activeTasks += 1;
      if (task.dueDate === todayISO) {
        dueTodayTasks += 1;
      }
      if (isTaskOverdue(task, todayISO)) {
        overdueTasks += 1;
      }
    }
  }

  const completionPercent =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return {
    totalTasks,
    activeTasks,
    completedTasks,
    dueTodayTasks,
    overdueTasks,
    completionPercent,
  };
}

export function createTaskItem(input: {
  id?: string;
  title: string;
  notes?: string;
  priority?: Priority;
  dueDate?: string | null;
  listId?: string;
  subtasks?: Subtask[];
}): Task {
  const trimmed = input.title.trim();
  if (!trimmed) {
    throw new Error('Task title cannot be empty');
  }

  return {
    id: input.id ?? `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: trimmed,
    notes: (input.notes ?? '').trim(),
    completed: false,
    priority: input.priority ?? 'medium',
    dueDate: input.dueDate ?? null,
    listId: input.listId ?? 'personal',
    subtasks: input.subtasks ?? [],
    createdAt: new Date().toISOString(),
    completedAt: null,
  };
}

function normalizeListColor(raw: unknown, index: number): ListColor {
  if (typeof raw === 'string' && LIST_COLORS.includes(raw as ListColor)) {
    return raw as ListColor;
  }
  return LIST_COLORS[index % LIST_COLORS.length];
}

export function parseImportedWorkspace(rawJson: string): WorkspaceState {
  const parsed: unknown = JSON.parse(rawJson);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid backup file: expected a JSON object.');
  }

  const record = parsed as Record<string, unknown>;
  if (!Array.isArray(record.tasks) || !Array.isArray(record.lists)) {
    throw new Error('Invalid backup file: missing tasks or lists arrays.');
  }

  const lists: TaskList[] = record.lists
    .filter(
      (item): item is TaskList =>
        Boolean(item) &&
        typeof item === 'object' &&
        typeof (item as TaskList).id === 'string' &&
        typeof (item as TaskList).name === 'string' &&
        (item as TaskList).name.trim().length > 0
    )
    .map((l, idx) => ({
      id: l.id,
      name: l.name.trim(),
      color: normalizeListColor((l as Partial<TaskList>).color, idx),
    }));

  const validListIds = new Set(lists.map((l) => l.id));
  const fallbackListId = lists[0]?.id ?? 'personal';

  const tasks: Task[] = record.tasks
    .filter(
      (item): item is Task =>
        Boolean(item) &&
        typeof item === 'object' &&
        typeof (item as Task).id === 'string' &&
        typeof (item as Task).title === 'string' &&
        (item as Task).title.trim().length > 0
    )
    .map((t) => ({
      id: t.id,
      title: t.title.trim(),
      notes: typeof t.notes === 'string' ? t.notes : '',
      completed: Boolean(t.completed),
      priority:
        t.priority === 'low' || t.priority === 'medium' || t.priority === 'high'
          ? t.priority
          : 'medium',
      dueDate:
        typeof t.dueDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(t.dueDate)
          ? t.dueDate
          : null,
      listId: validListIds.has(t.listId) ? t.listId : fallbackListId,
      subtasks: Array.isArray(t.subtasks)
        ? t.subtasks
            .filter(
              (s): s is Subtask =>
                Boolean(s) &&
                typeof s === 'object' &&
                typeof (s as Subtask).id === 'string' &&
                typeof (s as Subtask).title === 'string'
            )
            .map((s) => ({
              id: s.id,
              title: s.title.trim(),
              completed: Boolean(s.completed),
            }))
        : [],
      createdAt: typeof t.createdAt === 'string' ? t.createdAt : new Date().toISOString(),
      completedAt: typeof t.completedAt === 'string' ? t.completedAt : null,
    }));

  return {
    lists: lists.length > 0 ? lists : DEFAULT_LISTS,
    tasks,
  };
}
