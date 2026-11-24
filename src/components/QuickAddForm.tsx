import React, { useState } from 'react';
import { Flag, Plus } from 'lucide-react';
import type { Priority, TaskList } from '../types/todo';
import { addDaysISO, getLocalDateISO } from '../utils/tasks';

interface QuickAddFormProps {
  lists: TaskList[];
  defaultListId: string;
  defaultDueDate: string | null;
  onAddTask: (input: {
    title: string;
    priority: Priority;
    listId: string;
    dueDate: string | null;
  }) => void;
}

const PRIORITY_BUTTONS: Array<{
  value: Priority;
  label: string;
  activeClass: string;
}> = [
  {
    value: 'high',
    label: 'High',
    activeClass:
      'border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/60 dark:text-red-300',
  },
  {
    value: 'medium',
    label: 'Medium',
    activeClass:
      'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
  },
  {
    value: 'low',
    label: 'Low',
    activeClass:
      'border-teal-300 bg-teal-50 text-teal-800 dark:border-teal-800 dark:bg-teal-950/60 dark:text-teal-300',
  },
];

export function QuickAddForm({
  lists,
  defaultListId,
  defaultDueDate,
  onAddTask,
}: QuickAddFormProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [listId, setListId] = useState(defaultListId);
  const [dueDate, setDueDate] = useState(defaultDueDate ?? '');
  const [error, setError] = useState<string | null>(null);

  const todayISO = getLocalDateISO();
  const tomorrowISO = addDaysISO(todayISO, 1);

  React.useEffect(() => {
    if (!title.trim()) {
      setListId(defaultListId);
      setDueDate(defaultDueDate ?? '');
    }
  }, [defaultListId, defaultDueDate, title]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setError('Please enter a task title.');
      return;
    }

    onAddTask({
      title: trimmed,
      priority,
      listId: lists.some((l) => l.id === listId) ? listId : lists[0]?.id ?? 'personal',
      dueDate: dueDate || null,
    });

    setTitle('');
    setError(null);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3"
      aria-label="Quick add task"
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
        <div className="flex-1 min-w-0">
          <label htmlFor="quick-add-title" className="sr-only">
            New task title
          </label>
          <input
            id="quick-add-title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError(null);
            }}
            placeholder="What needs to be done? Type a task and press Enter..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-800"
          />
        </div>

        <button
          type="submit"
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <Plus className="h-4 w-4" />
          <span>Add Task</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <div role="group" aria-label="Task priority" className="inline-flex items-center gap-1">
            {PRIORITY_BUTTONS.map((btn) => {
              const isSelected = priority === btn.value;
              return (
                <button
                  key={btn.value}
                  type="button"
                  onClick={() => setPriority(btn.value)}
                  aria-pressed={isSelected}
                  className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-blue-600 ${
                    isSelected
                      ? btn.activeClass
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  <Flag className="h-3 w-3 shrink-0" aria-hidden="true" />
                  <span>{btn.label}</span>
                </button>
              );
            })}
          </div>

          <label htmlFor="quick-add-list" className="sr-only">
            List
          </label>
          <select
            id="quick-add-list"
            aria-label="Task list"
            value={listId}
            onChange={(e) => setListId(e.target.value)}
            className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-blue-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 max-w-[140px]"
          >
            {lists.map((list) => (
              <option key={list.id} value={list.id}>
                {list.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setDueDate(dueDate === todayISO ? '' : todayISO)}
            aria-pressed={dueDate === todayISO}
            className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
              dueDate === todayISO
                ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setDueDate(dueDate === tomorrowISO ? '' : tomorrowISO)}
            aria-pressed={dueDate === tomorrowISO}
            className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
              dueDate === tomorrowISO
                ? 'bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-950/60 dark:text-violet-300 dark:border-violet-800'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            Tomorrow
          </button>
          <label htmlFor="quick-add-due" className="sr-only">
            Due date
          </label>
          <input
            id="quick-add-due"
            type="date"
            aria-label="Due date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-mono text-slate-700 focus:border-blue-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          />
        </div>
      </div>

      {error && (
        <p className="text-xs font-medium text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
