import { AlertCircle, CalendarClock, CheckCircle2, ListTodo } from 'lucide-react';
import type { OverviewMetrics, SmartView } from '../types/todo';

interface OverviewStripProps {
  viewTitle: string;
  viewDescription: string;
  metrics: OverviewMetrics;
  onJumpToView: (view: SmartView) => void;
}

export function OverviewStrip({
  viewTitle,
  viewDescription,
  metrics,
  onJumpToView,
}: OverviewStripProps) {
  return (
    <section aria-label="Workspace overview" className="space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            {viewTitle}
          </h2>
          <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
            {viewDescription}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => onJumpToView('inbox')}
          className="text-left rounded-xl border border-blue-200/80 bg-blue-50/50 px-4 py-3.5 hover:border-blue-300 transition-colors dark:border-blue-900/50 dark:bg-blue-950/25 dark:hover:border-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-800 dark:text-blue-300">
              Active Tasks
            </span>
            <ListTodo className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="font-display text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-50">
              {metrics.activeTasks}
            </span>
            <span className="text-xs text-slate-600 dark:text-slate-400">open</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onJumpToView('today')}
          className="text-left rounded-xl border border-sky-200/80 bg-sky-50/50 px-4 py-3.5 hover:border-sky-300 transition-colors dark:border-sky-900/50 dark:bg-sky-950/25 dark:hover:border-sky-700 focus-visible:outline-2 focus-visible:outline-blue-600"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sky-800 dark:text-sky-300">
              Due Today
            </span>
            <CalendarClock className="h-4 w-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="font-display text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-50">
              {metrics.dueTodayTasks}
            </span>
            <span className="text-xs text-slate-600 dark:text-slate-400">scheduled</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onJumpToView('today')}
          className={`text-left rounded-xl border px-4 py-3.5 transition-colors focus-visible:outline-2 focus-visible:outline-blue-600 ${
            metrics.overdueTasks > 0
              ? 'border-rose-200 bg-rose-50/70 hover:border-rose-300 dark:border-rose-900/60 dark:bg-rose-950/30 dark:hover:border-rose-800'
              : 'border-emerald-200/80 bg-emerald-50/50 hover:border-emerald-300 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:hover:border-emerald-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-semibold ${
                metrics.overdueTasks > 0
                  ? 'text-rose-800 dark:text-rose-300'
                  : 'text-emerald-800 dark:text-emerald-300'
              }`}
            >
              Overdue
            </span>
            <AlertCircle
              className={`h-4 w-4 ${
                metrics.overdueTasks > 0
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            />
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span
              className={`font-display text-2xl font-bold tabular-nums ${
                metrics.overdueTasks > 0
                  ? 'text-rose-700 dark:text-rose-300'
                  : 'text-slate-900 dark:text-slate-50'
              }`}
            >
              {metrics.overdueTasks}
            </span>
            <span
              className={`text-xs ${
                metrics.overdueTasks > 0
                  ? 'text-rose-700 dark:text-rose-400 font-medium'
                  : 'text-emerald-700 dark:text-emerald-400 font-medium'
              }`}
            >
              {metrics.overdueTasks > 0 ? 'needs focus' : 'on track'}
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onJumpToView('completed')}
          className="text-left rounded-xl border border-emerald-200/80 bg-emerald-50/50 px-4 py-3.5 hover:border-emerald-300 transition-colors dark:border-emerald-900/50 dark:bg-emerald-950/25 dark:hover:border-emerald-700 focus-visible:outline-2 focus-visible:outline-blue-600"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              Progress
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-1.5 flex items-baseline justify-between gap-2">
            <span className="font-display text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-50">
              {metrics.completionPercent}%
            </span>
            <span className="font-mono text-xs tabular-nums text-slate-600 dark:text-slate-400">
              {metrics.completedTasks}/{metrics.totalTasks} done
            </span>
          </div>
          <div
            aria-hidden="true"
            className="mt-2 h-1.5 w-full rounded-full bg-emerald-200/70 dark:bg-emerald-950 overflow-hidden"
          >
            <div
              className="h-full rounded-full bg-emerald-600 dark:bg-emerald-500 transition-[width] duration-200"
              style={{ width: `${metrics.completionPercent}%` }}
            />
          </div>
        </button>
      </div>
    </section>
  );
}
