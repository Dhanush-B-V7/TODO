import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addDaysISO,
  computeOverviewMetrics,
  computeWorkspaceCounts,
  createSeedWorkspace,
  createTaskItem,
  filterAndSortTasks,
  formatDueDateLabel,
  isTaskDueToday,
  isTaskOverdue,
  parseImportedWorkspace,
} from './tasks';

const TODAY = '2026-11-24';

test('createTaskItem validates non-empty title and trims fields', () => {
  assert.throws(() => createTaskItem({ title: '   ' }), /cannot be empty/);

  const task = createTaskItem({
    title: '  Ship Vercel build  ',
    notes: '  Verify routes  ',
    priority: 'high',
    dueDate: TODAY,
    listId: 'launch',
  });

  assert.equal(task.title, 'Ship Vercel build');
  assert.equal(task.notes, 'Verify routes');
  assert.equal(task.priority, 'high');
  assert.equal(task.completed, false);
  assert.equal(task.listId, 'launch');
});

test('date helpers detect today and overdue accurately', () => {
  const yesterday = addDaysISO(TODAY, -1);
  const tomorrow = addDaysISO(TODAY, 1);

  const overdueTask = createTaskItem({ title: 'Past due', dueDate: yesterday });
  const todayTask = createTaskItem({ title: 'Due today', dueDate: TODAY });
  const futureTask = createTaskItem({ title: 'Future', dueDate: tomorrow });
  const doneOverdue = {
    ...createTaskItem({ title: 'Done past due', dueDate: yesterday }),
    completed: true,
  };

  assert.equal(isTaskOverdue(overdueTask, TODAY), true);
  assert.equal(isTaskDueToday(overdueTask, TODAY), true);
  assert.equal(isTaskOverdue(todayTask, TODAY), false);
  assert.equal(isTaskDueToday(todayTask, TODAY), true);
  assert.equal(isTaskDueToday(futureTask, TODAY), false);
  assert.equal(isTaskOverdue(doneOverdue, TODAY), false);

  assert.deepEqual(formatDueDateLabel(TODAY, TODAY), {
    label: 'Today',
    isOverdue: false,
    isToday: true,
  });
  assert.equal(formatDueDateLabel(yesterday, TODAY)?.isOverdue, true);
  assert.deepEqual(formatDueDateLabel(yesterday, TODAY, true), {
    label: 'Yesterday',
    isOverdue: false,
    isToday: false,
  });
});

test('filterAndSortTasks handles views, status, priority, search, and sorting', () => {
  const workspace = createSeedWorkspace(TODAY);

  const todayTasks = filterAndSortTasks(
    workspace.tasks,
    { view: 'today', status: 'all', priority: 'all', search: '', sort: 'created' },
    TODAY
  );
  // Seed has 3 tasks due today or overdue (not completed)
  assert.equal(todayTasks.length, 3);

  const completedTasks = filterAndSortTasks(
    workspace.tasks,
    { view: 'completed', status: 'all', priority: 'all', search: '', sort: 'created' },
    TODAY
  );
  assert.equal(completedTasks.length, 1);
  assert.equal(completedTasks[0].id, 'task-seed-6');

  const highPriorityInbox = filterAndSortTasks(
    workspace.tasks,
    { view: 'inbox', status: 'active', priority: 'high', search: 'vercel', sort: 'priority' },
    TODAY
  );
  assert.equal(highPriorityInbox.length, 1);
  assert.equal(highPriorityInbox[0].id, 'task-seed-2');

  const sortedByPriority = filterAndSortTasks(
    workspace.tasks,
    { view: 'inbox', status: 'active', priority: 'all', search: '', sort: 'priority' },
    TODAY
  );
  assert.equal(sortedByPriority[0].priority, 'high');
  assert.equal(sortedByPriority[sortedByPriority.length - 1].priority, 'low');
});

test('computeWorkspaceCounts computes accurate active and completed totals', () => {
  const workspace = createSeedWorkspace(TODAY);
  const counts = computeWorkspaceCounts(workspace.tasks, workspace.lists, TODAY);

  assert.equal(counts.inboxActive, 5);
  assert.equal(counts.todayActive, 3);
  assert.equal(counts.upcomingActive, 2);
  assert.equal(counts.completedTotal, 1);
  assert.equal(counts.byListActive.launch, 2);
  assert.equal(counts.byListActive.engineering, 2);
  assert.equal(counts.byListActive.personal, 1);
});

test('parseImportedWorkspace validates structure and sanitizes invalid fields', () => {
  assert.throws(() => parseImportedWorkspace('{"foo": 1}'), /missing tasks or lists/);

  const validJson = JSON.stringify({
    lists: [{ id: 'work', name: 'Work' }],
    tasks: [
      {
        id: 't1',
        title: '  Imported task  ',
        notes: 'Note',
        completed: false,
        priority: 'high',
        dueDate: '2026-12-01',
        listId: 'missing-list',
        subtasks: [{ id: 's1', title: 'Sub 1', completed: true }],
      },
    ],
  });

  const parsed = parseImportedWorkspace(validJson);
  assert.equal(parsed.lists.length, 1);
  assert.equal(parsed.lists[0].color, 'blue');
  assert.equal(parsed.tasks.length, 1);
  assert.equal(parsed.tasks[0].title, 'Imported task');
  assert.equal(parsed.tasks[0].listId, 'work');
  assert.equal(parsed.tasks[0].subtasks.length, 1);
});

test('computeOverviewMetrics calculates due today, overdue, and completion percent', () => {
  const workspace = createSeedWorkspace(TODAY);
  const metrics = computeOverviewMetrics(workspace.tasks, TODAY);

  assert.equal(metrics.totalTasks, 6);
  assert.equal(metrics.activeTasks, 5);
  assert.equal(metrics.completedTasks, 1);
  assert.equal(metrics.dueTodayTasks, 2);
  assert.equal(metrics.overdueTasks, 1);
  assert.equal(metrics.completionPercent, 17);
});
