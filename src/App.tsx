import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Menu,
  Plus,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';
import { HomePage } from './components/HomePage';
import { OverviewStrip } from './components/OverviewStrip';
import { QuickAddForm } from './components/QuickAddForm';
import { Sidebar } from './components/Sidebar';
import { TaskDetailModal } from './components/TaskDetailModal';
import { TaskRow } from './components/TaskRow';
import type {
  ListColor,
  Priority,
  SmartView,
  SortOption,
  StatusFilter,
  Subtask,
  Task,
  WorkspaceState,
} from './types/todo';
import {
  computeOverviewMetrics,
  computeWorkspaceCounts,
  createSeedWorkspace,
  createTaskItem,
  filterAndSortTasks,
  getLocalDateISO,
  parseImportedWorkspace,
} from './utils/tasks';

const STORAGE_KEY = 'kestrel.workspace.v1';
const THEME_KEY = 'kestrel.theme';

function loadInitialWorkspace(): WorkspaceState {
  if (typeof window === 'undefined') {
    return createSeedWorkspace();
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createSeedWorkspace();
    return parseImportedWorkspace(raw);
  } catch {
    return createSeedWorkspace();
  }
}

function loadInitialTheme(): boolean {
  if (typeof window === 'undefined') return false;
  const saved = window.localStorage.getItem(THEME_KEY);
  if (saved === 'dark') return true;
  if (saved === 'light') return false;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

function loadInitialPage(): 'home' | 'workspace' {
  if (typeof window === 'undefined') return 'home';
  const params = new URLSearchParams(window.location.search);
  return params.get('autostart') === '1' ? 'workspace' : 'home';
}

export default function App() {
  const [workspace, setWorkspace] = useState<WorkspaceState>(loadInitialWorkspace);
  const [isDark, setIsDark] = useState<boolean>(loadInitialTheme);
  const [page, setPage] = useState<'home' | 'workspace'>(loadInitialPage);
  const [activeView, setActiveView] = useState<SmartView | string>('inbox');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [sortOption, setSortOption] = useState<SortOption>('created');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [deletedUndo, setDeletedUndo] = useState<{ task: Task; index: number } | null>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  const todayISO = getLocalDateISO();

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
    } catch {
      // Ignore storage quota errors
    }
  }, [workspace]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    try {
      window.localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
    } catch {
      // Ignore storage errors
    }
  }, [isDark]);

  useEffect(() => {
    if (!deletedUndo) return;
    const timer = window.setTimeout(() => setDeletedUndo(null), 6000);
    return () => window.clearTimeout(timer);
  }, [deletedUndo]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 4000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const counts = useMemo(
    () => computeWorkspaceCounts(workspace.tasks, workspace.lists, todayISO),
    [workspace.tasks, workspace.lists, todayISO]
  );

  const overviewMetrics = useMemo(
    () => computeOverviewMetrics(workspace.tasks, todayISO),
    [workspace.tasks, todayISO]
  );

  const visibleTasks = useMemo(
    () =>
      filterAndSortTasks(
        workspace.tasks,
        {
          view: activeView,
          status: statusFilter,
          priority: priorityFilter,
          search: searchQuery,
          sort: sortOption,
        },
        todayISO
      ),
    [workspace.tasks, activeView, statusFilter, priorityFilter, searchQuery, sortOption, todayISO]
  );

  const viewMeta = useMemo(() => {
    if (activeView === 'inbox') {
      return {
        title: 'Inbox',
        description: 'All your active and completed tasks across lists in one place.',
      };
    }
    if (activeView === 'today') {
      return {
        title: 'Today',
        description: 'Tasks scheduled for today or overdue items that need immediate attention.',
      };
    }
    if (activeView === 'upcoming') {
      return {
        title: 'Upcoming',
        description: 'Scheduled tasks coming up after today so you can plan ahead.',
      };
    }
    if (activeView === 'completed') {
      return {
        title: 'Completed',
        description: 'Finished tasks kept for reference until you choose to clear them.',
      };
    }
    if (activeView.startsWith('list:')) {
      const id = activeView.slice(5);
      const listName = workspace.lists.find((l) => l.id === id)?.name ?? 'List';
      return {
        title: listName,
        description: `Focused view of tasks organized inside ${listName}.`,
      };
    }
    return { title: 'Tasks', description: 'Manage and organize your tasks.' };
  }, [activeView, workspace.lists]);

  const defaultListId = useMemo(() => {
    if (activeView.startsWith('list:')) {
      const id = activeView.slice(5);
      if (workspace.lists.some((l) => l.id === id)) return id;
    }
    return workspace.lists[0]?.id ?? 'personal';
  }, [activeView, workspace.lists]);

  const defaultDueDate = activeView === 'today' ? todayISO : null;

  const handleQuickAdd = (input: {
    title: string;
    priority: Priority;
    listId: string;
    dueDate: string | null;
  }) => {
    const newTask = createTaskItem(input);
    setWorkspace((prev) => ({
      ...prev,
      tasks: [newTask, ...prev.tasks],
    }));
  };

  const handleToggleTask = (taskId: string) => {
    setWorkspace((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              completed: !task.completed,
              completedAt: !task.completed ? new Date().toISOString() : null,
            }
          : task
      ),
    }));
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setWorkspace((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              subtasks: task.subtasks.map((sub) =>
                sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub
              ),
            }
          : task
      ),
    }));
  };

  const handleMoveToToday = (taskId: string) => {
    setWorkspace((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === taskId ? { ...task, dueDate: todayISO } : task
      ),
    }));
    setNotice({ type: 'success', message: 'Task scheduled for Today.' });
  };

  const handleOpenWorkspace = (view: SmartView | string = 'inbox') => {
    setActiveView(view);
    setPage('workspace');
  };

  const handleQuickAddFromHome = (title: string) => {
    const newTask = createTaskItem({
      title,
      priority: 'medium',
      listId: workspace.lists[0]?.id ?? 'personal',
      dueDate: todayISO,
    });
    setWorkspace((prev) => ({
      ...prev,
      tasks: [newTask, ...prev.tasks],
    }));
    setActiveView('inbox');
    setPage('workspace');
    setNotice({ type: 'success', message: `Added "${newTask.title}" for Today.` });
  };

  const handleDeleteTask = (taskId: string) => {
    setWorkspace((prev) => {
      const idx = prev.tasks.findIndex((t) => t.id === taskId);
      if (idx === -1) return prev;
      const target = prev.tasks[idx];
      setDeletedUndo({ task: target, index: idx });
      return {
        ...prev,
        tasks: prev.tasks.filter((t) => t.id !== taskId),
      };
    });
  };

  const handleUndoDelete = () => {
    if (!deletedUndo) return;
    setWorkspace((prev) => {
      if (prev.tasks.some((t) => t.id === deletedUndo.task.id)) return prev;
      const next = [...prev.tasks];
      next.splice(Math.min(deletedUndo.index, next.length), 0, deletedUndo.task);
      return { ...prev, tasks: next };
    });
    setDeletedUndo(null);
  };

  const handleSaveTaskModal = (payload: {
    id?: string;
    title: string;
    notes: string;
    priority: Priority;
    dueDate: string | null;
    listId: string;
    subtasks: Subtask[];
  }) => {
    if (payload.id) {
      setWorkspace((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) =>
          t.id === payload.id
            ? {
                ...t,
                title: payload.title,
                notes: payload.notes,
                priority: payload.priority,
                dueDate: payload.dueDate,
                listId: payload.listId,
                subtasks: payload.subtasks,
              }
            : t
        ),
      }));
    } else {
      const created = createTaskItem(payload);
      setWorkspace((prev) => ({
        ...prev,
        tasks: [created, ...prev.tasks],
      }));
    }
  };

  const handleClearCompleted = () => {
    setWorkspace((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => !t.completed),
    }));
  };

  const handleAddList = (name: string, color: ListColor) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const id = `${slug || 'list'}-${Date.now().toString(36)}`;
    setWorkspace((prev) => ({
      ...prev,
      lists: [...prev.lists, { id, name, color }],
    }));
    setActiveView(`list:${id}`);
  };

  const handleDeleteList = (listId: string) => {
    setWorkspace((prev) => {
      if (prev.lists.length <= 1) return prev;
      const remainingLists = prev.lists.filter((l) => l.id !== listId);
      const fallbackId = remainingLists[0].id;
      return {
        lists: remainingLists,
        tasks: prev.tasks.map((t) =>
          t.listId === listId ? { ...t, listId: fallbackId } : t
        ),
      };
    });
    if (activeView === `list:${listId}`) {
      setActiveView('inbox');
    }
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(workspace, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kestrel-tasks-${todayISO}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setNotice({ type: 'success', message: 'Tasks exported to JSON.' });
  };

  const handleImport = async (file: File) => {
    try {
      const text = await file.text();
      const imported = parseImportedWorkspace(text);
      setWorkspace(imported);
      setActiveView('inbox');
      setNotice({
        type: 'success',
        message: `Imported ${imported.tasks.length} tasks across ${imported.lists.length} lists.`,
      });
    } catch (err) {
      setNotice({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to import JSON file.',
      });
    }
  };

  const hasActiveFilters =
    statusFilter !== 'all' || priorityFilter !== 'all' || searchQuery.trim().length > 0;

  if (page === 'home') {
    return (
      <HomePage
        tasks={workspace.tasks}
        lists={workspace.lists}
        counts={counts}
        metrics={overviewMetrics}
        todayISO={todayISO}
        isDark={isDark}
        onToggleTheme={() => setIsDark((prev) => !prev)}
        onOpenWorkspace={handleOpenWorkspace}
        onToggleTask={handleToggleTask}
        onQuickAddAndOpen={handleQuickAddFromHome}
      />
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-b from-blue-50/70 via-slate-50 to-slate-50 text-slate-900 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950 dark:text-slate-100">
      <Sidebar
        activeView={activeView}
        onSelectView={setActiveView}
        onGoHome={() => setPage('home')}
        lists={workspace.lists}
        counts={counts}
        onAddList={handleAddList}
        onDeleteList={handleDeleteList}
        onExport={handleExport}
        onImport={handleImport}
        isDark={isDark}
        onToggleTheme={() => setIsDark((prev) => !prev)}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/95 backdrop-blur px-4 sm:px-8 py-3.5 dark:border-slate-800 dark:bg-slate-900/95">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden inline-flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-blue-600"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 text-sm min-w-0">
              <span className="text-slate-400 dark:text-slate-500 hidden sm:inline">Tasks</span>
              <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">/</span>
              <h1 className="font-display text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-50 truncate">
                {viewMeta.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="relative hidden sm:block sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                aria-label="Search tasks"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingTask(null);
                setModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <Plus className="h-4 w-4" />
              <span>New Task</span>
            </button>
          </div>
        </header>

        <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-8 py-6 space-y-5">
          <div className="relative sm:hidden">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              aria-label="Search tasks mobile"
              className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>

          {notice && (
            <div
              role="status"
              className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-2.5 text-xs font-medium ${
                notice.type === 'error'
                  ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-300'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300'
              }`}
            >
              <span>{notice.message}</span>
              <button
                type="button"
                onClick={() => setNotice(null)}
                aria-label="Dismiss message"
                className="p-1 hover:opacity-75"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <OverviewStrip
            viewTitle={viewMeta.title}
            viewDescription={viewMeta.description}
            metrics={overviewMetrics}
            onJumpToView={setActiveView}
          />

          {activeView !== 'completed' && (
            <QuickAddForm
              lists={workspace.lists}
              defaultListId={defaultListId}
              defaultDueDate={defaultDueDate}
              onAddTask={handleQuickAdd}
            />
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              {activeView !== 'completed' && (
                <div
                  role="group"
                  aria-label="Filter by status"
                  className="inline-flex items-center gap-1 rounded-lg bg-slate-200/70 p-1 dark:bg-slate-800/80"
                >
                  {(
                    [
                      { value: 'all', label: 'All' },
                      { value: 'active', label: 'Active' },
                      { value: 'completed', label: 'Completed' },
                    ] as Array<{ value: StatusFilter; label: string }>
                  ).map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setStatusFilter(item.value)}
                      aria-pressed={statusFilter === item.value}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-blue-600 ${
                        statusFilter === item.value
                          ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-slate-100'
                          : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}

              <select
                aria-label="Filter by priority"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as Priority | 'all')}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <option value="all">All priorities</option>
                <option value="high">High priority</option>
                <option value="medium">Medium priority</option>
                <option value="low">Low priority</option>
              </select>

              <select
                aria-label="Sort tasks"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <option value="created">Sort: Newest</option>
                <option value="dueDate">Sort: Due date</option>
                <option value="priority">Sort: Priority</option>
              </select>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-mono tabular-nums">
                {visibleTasks.length} {visibleTasks.length === 1 ? 'task' : 'tasks'}
              </span>
              {counts.completedTotal > 0 && (
                <button
                  type="button"
                  onClick={handleClearCompleted}
                  className="font-medium text-slate-600 hover:text-red-600 dark:text-slate-300 dark:hover:text-red-400 transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-blue-600"
                >
                  Clear completed
                </button>
              )}
            </div>
          </div>

          <section
            aria-label={`${viewMeta.title} task list`}
            className="rounded-xl border border-slate-200/90 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden"
          >
            {visibleTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
                <CheckCircle2 className="h-9 w-9 text-emerald-500/70 dark:text-emerald-400/60 mb-3" />
                <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
                  {hasActiveFilters ? 'No matching tasks' : `No tasks in ${viewMeta.title}`}
                </h2>
                <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                  {hasActiveFilters
                    ? 'Adjust your search query or filters to see tasks.'
                    : 'Add a task above to organize your next step.'}
                </p>
                {hasActiveFilters ? (
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter('all');
                      setPriorityFilter('all');
                      setSearchQuery('');
                    }}
                    className="mt-4 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    Clear filters
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTask(null);
                      setModalOpen(true);
                    }}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add your first task</span>
                  </button>
                )}
              </div>
            ) : (
              <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                {visibleTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    lists={workspace.lists}
                    todayISO={todayISO}
                    onToggle={handleToggleTask}
                    onToggleSubtask={handleToggleSubtask}
                    onMoveToToday={handleMoveToToday}
                    onEdit={(selected) => {
                      setEditingTask(selected);
                      setModalOpen(true);
                    }}
                    onDelete={handleDeleteTask}
                  />
                ))}
              </ul>
            )}
          </section>
        </main>
      </div>

      {deletedUndo && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-40 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-900 px-4 py-3 text-xs font-medium text-white shadow-lg dark:border-slate-700 dark:bg-slate-800"
        >
          <span className="max-w-[220px] truncate">
            Deleted &ldquo;{deletedUndo.task.title}&rdquo;
          </span>
          <button
            type="button"
            onClick={handleUndoDelete}
            className="inline-flex items-center gap-1 font-semibold text-blue-400 hover:text-blue-300 whitespace-nowrap"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Undo</span>
          </button>
          <button
            type="button"
            onClick={() => setDeletedUndo(null)}
            aria-label="Dismiss undo notification"
            className="text-slate-400 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <TaskDetailModal
        isOpen={modalOpen}
        task={editingTask}
        lists={workspace.lists}
        defaultListId={defaultListId}
        defaultDueDate={defaultDueDate}
        onClose={() => {
          setModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTaskModal}
      />
    </div>
  );
}
