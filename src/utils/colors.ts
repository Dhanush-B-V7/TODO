import type { ListColor } from '../types/todo';

export const LIST_COLOR_STYLES: Record<
  ListColor,
  {
    label: string;
    icon: string;
    text: string;
    swatch: string;
  }
> = {
  blue: {
    label: 'Blue',
    icon: 'text-blue-600 dark:text-blue-400',
    text: 'text-blue-700 dark:text-blue-400',
    swatch: 'bg-blue-600',
  },
  emerald: {
    label: 'Emerald',
    icon: 'text-emerald-600 dark:text-emerald-400',
    text: 'text-emerald-700 dark:text-emerald-400',
    swatch: 'bg-emerald-600',
  },
  violet: {
    label: 'Violet',
    icon: 'text-violet-600 dark:text-violet-400',
    text: 'text-violet-700 dark:text-violet-400',
    swatch: 'bg-violet-600',
  },
  amber: {
    label: 'Amber',
    icon: 'text-amber-600 dark:text-amber-400',
    text: 'text-amber-700 dark:text-amber-400',
    swatch: 'bg-amber-500',
  },
  rose: {
    label: 'Rose',
    icon: 'text-rose-600 dark:text-rose-400',
    text: 'text-rose-700 dark:text-rose-400',
    swatch: 'bg-rose-600',
  },
  teal: {
    label: 'Teal',
    icon: 'text-teal-600 dark:text-teal-400',
    text: 'text-teal-700 dark:text-teal-400',
    swatch: 'bg-teal-600',
  },
};
