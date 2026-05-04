import type {
  BootstrapResponse,
  DropdownItem,
  DropdownKind,
  Status,
  Task,
  TaskInput,
} from '../lib/types';
import { SAMPLE_DATA } from './sampleData';

const STORAGE_KEY = 'taskflow.localdata.v1';

interface Store {
  tasks: Task[];
  projects: DropdownItem[];
  labels: DropdownItem[];
  users: DropdownItem[];
}

function readStore(): Store {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Store;
  } catch {
    // ignore
  }
  return {
    tasks: SAMPLE_DATA.tasks,
    projects: SAMPLE_DATA.projects,
    labels: SAMPLE_DATA.labels,
    users: SAMPLE_DATA.users,
  };
}

function writeStore(store: Store) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore
  }
}

function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return 'local-' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function buildTask(input: TaskInput): Task {
  const now = new Date().toISOString();
  return {
    id: uuid(),
    title: input.title ?? '',
    description: input.description ?? '',
    link: input.link ?? '',
    priority: input.priority ?? 'Medium',
    status: input.status ?? 'To Do',
    dueDate: input.dueDate ?? '',
    labels: input.labels ?? [],
    project: input.project ?? '',
    reminderDate: input.reminderDate ?? '',
    assignedTo: input.assignedTo ?? '',
    assignedBy: input.assignedBy ?? '',
    createdAt: now,
    updatedAt: now,
  };
}

export const localApi = {
  bootstrap(): Promise<BootstrapResponse> {
    const store = readStore();
    return Promise.resolve({
      ...store,
      statuses: SAMPLE_DATA.statuses,
      priorities: SAMPLE_DATA.priorities,
    });
  },

  createTask(input: TaskInput): Promise<Task> {
    const store = readStore();
    const task = buildTask(input);
    store.tasks = [...store.tasks, task];
    writeStore(store);
    return Promise.resolve(task);
  },

  updateTask(id: string, patch: Partial<TaskInput>): Promise<Task> {
    const store = readStore();
    const idx = store.tasks.findIndex((t) => t.id === id);
    if (idx < 0) return Promise.reject(new Error('Task not found'));
    const updated: Task = {
      ...store.tasks[idx],
      ...patch,
      labels: patch.labels ?? store.tasks[idx].labels,
      updatedAt: new Date().toISOString(),
    };
    store.tasks[idx] = updated;
    writeStore(store);
    return Promise.resolve(updated);
  },

  updateStatus(id: string, status: Status): Promise<{ ok: true }> {
    const store = readStore();
    const idx = store.tasks.findIndex((t) => t.id === id);
    if (idx < 0) return Promise.reject(new Error('Task not found'));
    store.tasks[idx] = { ...store.tasks[idx], status, updatedAt: new Date().toISOString() };
    writeStore(store);
    return Promise.resolve({ ok: true });
  },

  deleteTask(id: string): Promise<{ ok: true }> {
    const store = readStore();
    store.tasks = store.tasks.filter((t) => t.id !== id);
    writeStore(store);
    return Promise.resolve({ ok: true });
  },

  addDropdown(kind: DropdownKind, name: string): Promise<DropdownItem> {
    const store = readStore();
    const item: DropdownItem = { id: uuid(), name };
    store[kind] = [...store[kind], item];
    writeStore(store);
    return Promise.resolve(item);
  },

  deleteDropdown(kind: DropdownKind, id: string): Promise<{ ok: true }> {
    const store = readStore();
    store[kind] = store[kind].filter((d) => d.id !== id);
    writeStore(store);
    return Promise.resolve({ ok: true });
  },

  reset(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  },
};
