import React, { useRef, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Download,
  Folder,
  Home,
  Inbox,
  Moon,
  Plus,
  Sun,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import type { ListColor, SmartView, TaskList } from '../types/todo';
import { LIST_COLOR_STYLES } from '../utils/colors';
import { LIST_COLORS, type WorkspaceCounts } from '../utils/tasks';

interface SidebarProps {
  activeView: SmartView | string;
  onSelectView: (view: SmartView | string) => void;
  onGoHome: () => void;
  lists: TaskList[];
  counts: WorkspaceCounts;
  onAddList: (name: string, color: ListColor) => void;
  onDeleteList: (listId: string) => void;
  onExport: () => void;
  onImport: (file: File) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const SMART_VIEWS: Array<{
  id: SmartView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
}> = [
  { id: 'inbox', label: 'Inbox', icon: Inbox, iconColor: 'text-blue-600 dark:text-blue-400' },
  { id: 'today', label: 'Today', icon: Sun, iconColor: 'text-amber-500 dark:text-amber-400' },
  {
    id: 'upcoming',
    label: 'Upcoming',
    icon: Calendar,
    iconColor: 'text-violet-600 dark:text-violet-400',
  },
  {
    id: 'completed',
    label: 'Completed',
    icon: CheckCircle2,
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
];

export function Sidebar({
  activeView,
  onSelectView,
  onGoHome,
  lists,
  counts,
  onAddList,
  onDeleteList,
  onExport,
  onImport,
  isDark,
  onToggleTheme,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListColor, setNewListColor] = useState<ListColor>('blue');
  const [listError, setListError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getViewCount = (viewId: SmartView): number => {
    switch (viewId) {
      case 'inbox':
        return counts.inboxActive;
      case 'today':
        return counts.todayActive;
      case 'upcoming':
        return counts.upcomingActive;
      case 'completed':
        return counts.completedTotal;
    }
  };

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newListName.trim();
    if (!trimmed) {
      setListError('Enter a list name');
      return;
    }
    if (lists.some((l) => l.name.toLowerCase() === trimmed.toLowerCase())) {
      setListError('List already exists');
      return;
    }
    onAddList(trimmed, newListColor);
    setNewListName('');
    setNewListColor('blue');
    setListError(null);
    setIsAddingList(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      e.target.value = '';
    }
  };

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      <div className="flex-1 overflow-y-auto px-4 py-5">
        <div className="flex items-center justify-between mb-5 px-2">
          <button
            type="button"
            onClick={() => {
              onGoHome();
              onCloseMobile();
            }}
            className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50 whitespace-nowrap hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus-visible:outline-2 focus-visible:outline-blue-600 rounded"
          >
            Kestrel
          </button>
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close navigation menu"
            className="lg:hidden inline-flex items-center justify-center rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 focus-visible:outline-2 focus-visible:outline-blue-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            onGoHome();
            onCloseMobile();
          }}
          className="w-full mb-2 flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-100 transition-colors focus-visible:outline-2 focus-visible:outline-blue-600"
        >
          <Home className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
          <span>Home Page</span>
        </button>

        <nav aria-label="Smart Views" className="space-y-1">
          {SMART_VIEWS.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            const count = getViewCount(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectView(item.id);
                  onCloseMobile();
                }}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-blue-600 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/70'
                }`}
              >
                <span className="flex items-center gap-2.5 truncate">
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      isActive ? 'text-blue-600 dark:text-blue-400' : item.iconColor
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </span>
                <span
                  className={`font-mono text-xs tabular-nums ${
                    isActive
                      ? 'text-blue-700 dark:text-blue-300 font-semibold'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="mt-8">
          <div className="flex items-center justify-between px-2 mb-2">
            <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Lists
            </h2>
            <button
              type="button"
              onClick={() => {
                setIsAddingList((prev) => !prev);
                setListError(null);
              }}
              aria-label="Create new list"
              aria-expanded={isAddingList}
              className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 focus-visible:outline-2 focus-visible:outline-blue-600"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New</span>
            </button>
          </div>

          {isAddingList && (
            <form onSubmit={handleCreateList} className="mb-3 px-1 space-y-2">
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => {
                    setNewListName(e.target.value);
                    if (listError) setListError(null);
                  }}
                  placeholder="List name..."
                  aria-label="New list name"
                  autoFocus
                  className="w-full min-w-0 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-md bg-blue-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600"
                >
                  Add
                </button>
              </div>
              <div className="flex items-center gap-1.5" role="group" aria-label="List color">
                {LIST_COLORS.map((color) => {
                  const style = LIST_COLOR_STYLES[color];
                  const selected = newListColor === color;
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewListColor(color)}
                      aria-label={`Select ${style.label} color`}
                      aria-pressed={selected}
                      className={`h-5 w-5 rounded-md ${style.swatch} transition-transform ${
                        selected
                          ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white dark:ring-offset-slate-900 scale-105'
                          : 'opacity-75 hover:opacity-100'
                      }`}
                    />
                  );
                })}
              </div>
              {listError && (
                <p className="text-xs text-red-600 dark:text-red-400" role="alert">
                  {listError}
                </p>
              )}
            </form>
          )}

          <nav aria-label="Task Lists" className="space-y-1">
            {lists.map((list) => {
              const viewKey = `list:${list.id}`;
              const isActive = activeView === viewKey;
              const activeCount = counts.byListActive[list.id] ?? 0;
              const colorStyle = LIST_COLOR_STYLES[list.color] ?? LIST_COLOR_STYLES.blue;

              return (
                <div key={list.id} className="group flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectView(viewKey);
                      onCloseMobile();
                    }}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex-1 min-w-0 flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-blue-600 ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/70'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 truncate">
                      <Folder className={`h-4 w-4 shrink-0 ${colorStyle.icon}`} />
                      <span className="truncate">{list.name}</span>
                    </span>
                    <span className="font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
                      {activeCount}
                    </span>
                  </button>
                  {lists.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onDeleteList(list.id)}
                      aria-label={`Delete list ${list.name}`}
                      className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-red-400 transition-opacity focus-visible:outline-2 focus-visible:outline-blue-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800 p-4 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onExport}
            aria-label="Export tasks as JSON"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/70 transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-blue-600"
          >
            <Download className="h-3.5 w-3.5 shrink-0" />
            <span>Export</span>
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Import tasks from JSON"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/70 transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-blue-600"
          >
            <Upload className="h-3.5 w-3.5 shrink-0" />
            <span>Import</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleFileChange}
            className="hidden"
            aria-label="Import tasks from JSON file"
          />
        </div>

        <button
          type="button"
          onClick={onToggleTheme}
          className="w-full inline-flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors focus-visible:outline-2 focus-visible:outline-blue-600"
        >
          <span className="flex items-center gap-2">
            {isDark ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-indigo-600" />
            )}
            <span>{isDark ? 'Light appearance' : 'Dark appearance'}</span>
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-[1px]"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative z-10 w-72 max-w-[85vw] h-full shadow-xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
