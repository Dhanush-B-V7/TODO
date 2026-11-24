import React, { useState } from 'react';
import {
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  Flag,
  Folder,
  Layers,
  Moon,
  Plus,
  Rocket,
  Sparkles,
  Sun,
} from 'lucide-react';
import type { OverviewMetrics, SmartView, Task, TaskList } from '../types/todo';
import { LIST_COLOR_STYLES } from '../utils/colors';
import { formatDueDateLabel, type WorkspaceCounts } from '../utils/tasks';

interface HomePageProps {
  tasks: Task[];
  lists: TaskList[];
  counts: WorkspaceCounts;
  metrics: OverviewMetrics;
  todayISO: string;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenWorkspace: (view?: SmartView | string) => void;
  onToggleTask: (taskId: string) => void;
  onQuickAddAndOpen: (title: string) => void;
}

export function HomePage({
  tasks,
  lists,
  counts,
  metrics,
  todayISO,
  isDark,
  onToggleTheme,
  onOpenWorkspace,
  onToggleTask,
  onQuickAddAndOpen,
}: HomePageProps) {
  const [quickTitle, setQuickTitle] = useState('');
  const [quickError, setQuickError] = useState<string | null>(null);

  const previewTasks = tasks.filter((t) => !t.completed).slice(0, 4);

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = quickTitle.trim();
    if (!trimmed) {
      setQuickError('Type a task title to get started.');
      return;
    }
    onQuickAddAndOpen(trimmed);
    setQuickTitle('');
    setQuickError(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50/80 via-slate-50 to-white text-slate-900 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950 dark:text-slate-100">
      {/* Strict 3-Zone Top Bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto max-w-6xl px-4 sm:px-8 py-4 flex items-center justify-between gap-8">
          <a
            href="#top"
            className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50 whitespace-nowrap shrink-0"
          >
            Kestrel
          </a>

          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300"
          >
            <a
              href="#overview"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0"
            >
              Overview
            </a>
            <a
              href="#features"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0"
            >
              Features
            </a>
            <a
              href="#lists"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0"
            >
              Lists
            </a>
            <a
              href="#deploy"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0"
            >
              Deploy
            </a>
          </nav>

          <div className="shrink-0">
            <button
              type="button"
              onClick={() => onOpenWorkspace('inbox')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <span>Open Workspace</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      <main id="top" className="flex-1">
        {/* Hero Split */}
        <section id="overview" className="mx-auto max-w-6xl px-4 sm:px-8 pt-10 pb-14 lg:pt-14 lg:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
              <div className="space-y-4">
                <p className="text-xs font-semibold tracking-wide text-blue-600 dark:text-blue-400">
                  Focused Task Planner
                </p>
                <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-50 leading-[1.1] [text-wrap:balance]">
                  Plan your day with clarity and color.
                </h1>
                <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                  Organize tasks by color-coded lists, schedule due dates in one click, and track
                  progress across subtasks—with instant browser storage and zero-config Vercel
                  deployment.
                </p>
              </div>

              {/* Quick task starter right on the front page */}
              <form
                onSubmit={handleQuickSubmit}
                className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex flex-col sm:flex-row gap-2">
                  <label htmlFor="home-quick-task" className="sr-only">
                    Add your next task
                  </label>
                  <input
                    id="home-quick-task"
                    type="text"
                    value={quickTitle}
                    onChange={(e) => {
                      setQuickTitle(e.target.value);
                      if (quickError) setQuickError(null);
                    }}
                    placeholder="Add a task to start right now..."
                    className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add &amp; Open</span>
                  </button>
                </div>
                {quickError && (
                  <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-400" role="alert">
                    {quickError}
                  </p>
                )}
              </form>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => onOpenWorkspace('today')}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 hover:border-blue-300 hover:text-blue-700 transition-colors dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-700 whitespace-nowrap"
                >
                  <Sun className="h-4 w-4 text-amber-500" />
                  <span>View Today ({counts.todayActive})</span>
                </button>

                <button
                  type="button"
                  onClick={onToggleTheme}
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
                >
                  {isDark ? (
                    <Sun className="h-4 w-4 text-amber-400" />
                  ) : (
                    <Moon className="h-4 w-4 text-indigo-600" />
                  )}
                  <span>{isDark ? 'Light mode' : 'Dark mode'}</span>
                </button>
              </div>
            </div>

            {/* Right Column: Live Interactive Workspace Preview */}
            <div className="lg:col-span-6 flex flex-col">
              <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                    <div>
                      <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-50">
                        Live Task Queue
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Check off items directly or open the full workspace
                      </p>
                    </div>
                    <span className="font-mono text-xs font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                      {metrics.completionPercent}% done
                    </span>
                  </div>

                  {/* Live progress bar */}
                  <div className="mt-3 mb-4 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 via-sky-500 to-emerald-500 transition-[width] duration-200"
                      style={{ width: `${metrics.completionPercent}%` }}
                    />
                  </div>

                  {previewTasks.length === 0 ? (
                    <div className="py-10 text-center">
                      <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        All active tasks completed!
                      </p>
                      <button
                        type="button"
                        onClick={() => onOpenWorkspace('inbox')}
                        className="mt-3 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                      >
                        Open workspace to add more
                      </button>
                    </div>
                  ) : (
                    <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                      {previewTasks.map((task) => {
                        const listObj = lists.find((l) => l.id === task.listId);
                        const listStyle = LIST_COLOR_STYLES[listObj?.color ?? 'blue'];
                        const dueMeta = formatDueDateLabel(task.dueDate, todayISO, task.completed);

                        return (
                          <li key={task.id} className="py-3 flex items-start gap-3">
                            <button
                              type="button"
                              onClick={() => onToggleTask(task.id)}
                              aria-label={`Complete "${task.title}"`}
                              className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-white text-transparent hover:border-emerald-600 dark:border-slate-600 dark:bg-slate-950 transition-colors"
                            >
                              <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                            </button>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                                {task.title}
                              </p>
                              <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                <span className={`font-medium ${listStyle.text}`}>
                                  {listObj?.name ?? 'Personal'}
                                </span>
                                {dueMeta && (
                                  <>
                                    <span aria-hidden="true">·</span>
                                    <span
                                      className={`font-mono tabular-nums ${
                                        dueMeta.isOverdue
                                          ? 'text-red-600 dark:text-red-400 font-medium'
                                          : dueMeta.isToday
                                          ? 'text-blue-600 dark:text-blue-400 font-medium'
                                          : ''
                                      }`}
                                    >
                                      {dueMeta.label}
                                    </span>
                                  </>
                                )}
                                <span aria-hidden="true">·</span>
                                <span
                                  className={`inline-flex items-center gap-1 ${
                                    task.priority === 'high'
                                      ? 'text-red-600 dark:text-red-400'
                                      : task.priority === 'medium'
                                      ? 'text-amber-600 dark:text-amber-400'
                                      : 'text-teal-700 dark:text-teal-400'
                                  }`}
                                >
                                  <Flag className="h-3 w-3" aria-hidden="true" />
                                  <span className="capitalize">{task.priority}</span>
                                </span>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
                    {metrics.activeTasks} active · {metrics.overdueTasks} overdue
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenWorkspace('inbox')}
                    className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <span>Manage all tasks</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Color-Coded Lists Quick-Jump Section */}
        <section id="lists" className="mx-auto max-w-6xl px-4 sm:px-8 pb-12">
          <div className="flex items-end justify-between gap-4 mb-5">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                Your Color-Coded Lists
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Jump directly into any project list or smart view with a single click.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lists.map((list) => {
              const colorStyle = LIST_COLOR_STYLES[list.color] ?? LIST_COLOR_STYLES.blue;
              const activeCount = counts.byListActive[list.id] ?? 0;

              return (
                <button
                  key={list.id}
                  type="button"
                  onClick={() => onOpenWorkspace(`list:${list.id}`)}
                  className="group text-left rounded-xl border border-slate-200 bg-white p-5 hover:border-blue-300 transition-colors dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600"
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2.5">
                      <span
                        className={`h-3 w-3 rounded-sm ${colorStyle.swatch}`}
                        aria-hidden="true"
                      />
                      <span className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
                        {list.name}
                      </span>
                    </span>
                    <Folder className={`h-4 w-4 ${colorStyle.icon}`} />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-mono tabular-nums">
                      {activeCount} active {activeCount === 1 ? 'task' : 'tasks'}
                    </span>
                    <span className="inline-flex items-center gap-1 font-medium text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform">
                      <span>Open list</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Asymmetric Capabilities Bento Grid */}
        <section id="features" className="mx-auto max-w-6xl px-4 sm:px-8 pb-14">
          <div className="mb-6">
            <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Built to stay fast and simple
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Every control is designed for quick capture, clear priority colors, and zero clutter.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 rounded-2xl border border-blue-200/80 bg-blue-50/60 p-6 dark:border-blue-900/50 dark:bg-blue-950/25">
              <div className="flex items-center gap-2.5 text-blue-700 dark:text-blue-300 mb-3">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-semibold">01. Visual Priority &amp; Schedule Clarity</span>
              </div>
              <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-50">
                Spot overdue and high-priority work immediately
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                Tasks pair distinct color cues with clear labels—crimson flags for high priority,
                amber for medium, teal for low, and emerald checkmarks for completed items—so you
                always know what deserves focus first.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200/80 bg-amber-50/60 p-6 dark:border-amber-900/50 dark:bg-amber-950/20">
              <div className="flex items-center gap-2.5 text-amber-700 dark:text-amber-300 mb-3">
                <Calendar className="h-4 w-4" />
                <span className="text-xs font-semibold">02. One-Click Scheduling</span>
              </div>
              <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-50">
                Today &amp; Tomorrow shortcuts
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Pick a due date with one tap or reschedule any overdue item straight into Today
                without hunting through calendar popups.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/60 p-6 dark:border-emerald-900/50 dark:bg-emerald-950/20">
              <div className="flex items-center gap-2.5 text-emerald-700 dark:text-emerald-300 mb-3">
                <Layers className="h-4 w-4" />
                <span className="text-xs font-semibold">03. Inline Subtasks</span>
              </div>
              <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-50">
                Break down big tasks
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Expand checklists directly inside your task list to tick off steps while watching
                your live completion bar update.
              </p>
            </div>

            <div
              id="deploy"
              className="lg:col-span-2 rounded-2xl border border-violet-200/80 bg-violet-50/60 p-6 dark:border-violet-900/50 dark:bg-violet-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2.5 text-violet-700 dark:text-violet-300 mb-3">
                  <Rocket className="h-4 w-4" />
                  <span className="text-xs font-semibold">04. GitHub &amp; Vercel Ready</span>
                </div>
                <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-50">
                  Zero-config deployment with local backups
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                  Includes <code className="font-mono text-xs">vercel.json</code> SPA routing,
                  automated unit tests, and one-click JSON export/import so your tasks stay portable.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onOpenWorkspace('inbox')}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0"
              >
                <span>Open Workspace</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-display font-semibold text-slate-800 dark:text-slate-200">
            Kestrel Task Planner
          </span>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => onOpenWorkspace('inbox')}
              className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              Workspace
            </button>
            <button
              type="button"
              onClick={() => onOpenWorkspace('today')}
              className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              Today
            </button>
            <button
              type="button"
              onClick={onToggleTheme}
              className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              {isDark ? 'Switch to Light' : 'Switch to Dark'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
