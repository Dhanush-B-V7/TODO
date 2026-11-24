import { useState } from 'react';
import { CalendarCheck, Check, ChevronDown, ChevronRight, Flag, Pencil, Trash2 } from 'lucide-react';
import type { Task, TaskList } from '../types/todo';
import { LIST_COLOR_STYLES } from '../utils/colors';
import { formatDueDateLabel } from '../utils/tasks';

interface TaskRowProps {
  task: Task;
  lists: TaskList[];
  todayISO: string;
  onToggle: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onMoveToToday: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const PRIORITY_META: Record<Task['priority'], { label: string; className: string }> = {
  high: {
    label: 'High priority',
    className: 'text-red-600 dark:text-red-400 font-medium',
  },
  medium: {
    label: 'Medium priority',
    className: 'text-amber-700 dark:text-amber-400 font-medium',
  },
  low: {
    label: 'Low priority',
    className: 'text-teal-700 dark:text-teal-400 font-medium',
  },
};

export function TaskRow({
  task,
  lists,
  todayISO,
  onToggle,
  onToggleSubtask,
  onMoveToToday,
  onEdit,
  onDelete,
}: TaskRowProps) {
  const [subtasksExpanded, setSubtasksExpanded] = useState(false);

  const listObj = lists.find((l) => l.id === task.listId);
  const listName = listObj?.name ?? 'Personal';
  const listColorStyle = LIST_COLOR_STYLES[listObj?.color ?? 'blue'];

  const dueMeta = formatDueDateLabel(task.dueDate, todayISO, task.completed);
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = task.subtasks.length;
  const priorityInfo = PRIORITY_META[task.priority];

  return (
    <li
      data-testid="task-row"
      className={`group px-4 py-3.5 transition-colors duration-150 ${
        task.completed
          ? 'bg-slate-50/40 dark:bg-slate-900/60'
          : 'hover:bg-slate-50/90 dark:hover:bg-slate-800/40'
      }`}
    >
      <div className="flex items-start gap-3.5">
        <button
          type="button"
          onClick={() => onToggle(task.id)}
          aria-label={
            task.completed
              ? `Mark "${task.title}" as active`
              : `Mark "${task.title}" as complete`
          }
          aria-pressed={task.completed}
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
            task.completed
              ? 'border-emerald-600 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-500'
              : 'border-slate-300 bg-white text-transparent hover:border-blue-600 dark:border-slate-600 dark:bg-slate-900 dark:hover:border-blue-400'
          }`}
        >
          <Check className="h-3.5 w-3.5 stroke-[2.5]" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <button
              type="button"
              onClick={() => onEdit(task)}
              className={`text-left text-sm font-medium leading-snug break-words focus-visible:outline-2 focus-visible:outline-blue-600 rounded ${
                task.completed
                  ? 'line-through text-slate-400 dark:text-slate-500'
                  : 'text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              {task.title}
            </button>
          </div>

          {task.notes && (
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
              {task.notes}
            </p>
          )}

          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
            <span className={`font-medium ${task.completed ? 'text-slate-400 dark:text-slate-500' : listColorStyle.text}`}>
              {listName}
            </span>

            {dueMeta && (
              <>
                <span aria-hidden="true">·</span>
                <span
                  className={`font-mono tabular-nums ${
                    dueMeta.isOverdue && !task.completed
                      ? 'text-red-600 dark:text-red-400 font-semibold'
                      : dueMeta.isToday && !task.completed
                      ? 'text-blue-600 dark:text-blue-400 font-semibold'
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
                task.completed ? 'text-slate-400 dark:text-slate-500' : priorityInfo.className
              }`}
            >
              <Flag className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span>{priorityInfo.label}</span>
            </span>

            {totalSubtasks > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => setSubtasksExpanded((prev) => !prev)}
                  aria-expanded={subtasksExpanded}
                  className="inline-flex items-center gap-1 font-mono tabular-nums text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-colors focus-visible:outline-2 focus-visible:outline-blue-600 rounded"
                >
                  {subtasksExpanded ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                  <span>
                    {completedSubtasks}/{totalSubtasks} subtasks
                  </span>
                </button>
              </>
            )}
          </div>

          {subtasksExpanded && totalSubtasks > 0 && (
            <ul className="mt-2.5 space-y-1.5 border-l border-slate-200 pl-3 dark:border-slate-700">
              {task.subtasks.map((sub) => (
                <li key={sub.id}>
                  <button
                    type="button"
                    onClick={() => onToggleSubtask(task.id, sub.id)}
                    aria-label={
                      sub.completed
                        ? `Mark subtask "${sub.title}" incomplete`
                        : `Mark subtask "${sub.title}" complete`
                    }
                    className="flex items-center gap-2 text-left text-xs group/sub focus-visible:outline-2 focus-visible:outline-blue-600 rounded"
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                        sub.completed
                          ? 'border-emerald-600 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-500'
                          : 'border-slate-300 bg-white group-hover/sub:border-blue-600 dark:border-slate-600 dark:bg-slate-900'
                      }`}
                    >
                      {sub.completed && <Check className="h-2.5 w-2.5 stroke-[2.5]" />}
                    </span>
                    <span
                      className={
                        sub.completed
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-700 dark:text-slate-300'
                      }
                    >
                      {sub.title}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity">
          {!task.completed && task.dueDate !== todayISO && (
            <button
              type="button"
              onClick={() => onMoveToToday(task.id)}
              aria-label={`Schedule "${task.title}" for today`}
              title="Move to Today"
              className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/60 focus-visible:outline-2 focus-visible:outline-blue-600 whitespace-nowrap"
            >
              <CalendarCheck className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Today</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => onEdit(task)}
            aria-label={`Edit "${task.title}"`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100 focus-visible:outline-2 focus-visible:outline-blue-600"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(task.id)}
            aria-label={`Delete "${task.title}"`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/60 dark:hover:text-red-400 focus-visible:outline-2 focus-visible:outline-blue-600"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </li>
  );
}
