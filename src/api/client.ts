import type {
  BootstrapResponse,
  DropdownItem,
  DropdownKind,
  Status,
  Task,
  TaskInput,
} from '../lib/types';
import { localApi } from './localApi';

const ENDPOINT = import.meta.env.VITE_APPS_SCRIPT_URL as string | undefined;
// In dev, route through Vite's proxy at /gas (configured in vite.config.ts) to
// avoid CORS/redirect issues with script.google.com → script.googleusercontent.com.
const USE_PROXY = import.meta.env.DEV;
const REMOTE_CONFIGURED = USE_PROXY ? Boolean(ENDPOINT) : Boolean(ENDPOINT);

// ---------- Mode tracking ----------

export type ApiMode = 'remote' | 'local';
type ModeListener = (mode: ApiMode, reason?: string) => void;

let currentMode: ApiMode = REMOTE_CONFIGURED ? 'remote' : 'local';
let lastReason: string | undefined = REMOTE_CONFIGURED
  ? undefined
  : 'No Apps Script URL configured.';
const listeners = new Set<ModeListener>();

export function getApiMode(): ApiMode {
  return currentMode;
}
export function getApiModeReason(): string | undefined {
  return lastReason;
}
export function subscribeApiMode(fn: ModeListener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
function setMode(mode: ApiMode, reason?: string) {
  if (currentMode === mode && lastReason === reason) return;
  currentMode = mode;
  lastReason = reason;
  listeners.forEach((fn) => fn(mode, reason));
}

// ---------- Remote (Apps Script) ----------

function endpoint(): string {
  if (USE_PROXY) return '/gas';
  if (!ENDPOINT) {
    throw new Error('VITE_APPS_SCRIPT_URL is not set.');
  }
  return ENDPOINT;
}

async function parseResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  const trimmed = text.trim();
  if (trimmed.startsWith('<')) {
    throw new Error(
      'Apps Script returned an HTML page instead of JSON. The deployment likely requires sign-in (Who has access ≠ Anyone), or the script has not been authorized.',
    );
  }
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Could not parse response as JSON: ${trimmed.slice(0, 120)}`);
  }
  if (json && typeof json === 'object' && 'error' in json && (json as { error?: string }).error) {
    throw new Error(String((json as { error: string }).error));
  }
  return json as T;
}

async function getJson<T>(params: Record<string, string>): Promise<T> {
  const url = new URL(endpoint(), window.location.origin);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), { method: 'GET', redirect: 'follow' });
  return parseResponse<T>(res);
}

async function postJson<T>(body: Record<string, unknown>): Promise<T> {
  const url = new URL(endpoint(), window.location.origin).toString();
  const res = await fetch(url, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(body),
  });
  return parseResponse<T>(res);
}

const remoteApi = {
  bootstrap: () => getJson<BootstrapResponse>({ action: 'bootstrap' }),
  createTask: (task: TaskInput) =>
    postJson<{ task: Task }>({ action: 'createTask', task }).then((r) => r.task),
  updateTask: (id: string, patch: Partial<TaskInput>) =>
    postJson<{ task: Task }>({ action: 'updateTask', id, patch }).then((r) => r.task),
  updateStatus: (id: string, status: Status) =>
    postJson<{ ok: true }>({ action: 'updateStatus', id, status }),
  deleteTask: (id: string) => postJson<{ ok: true }>({ action: 'deleteTask', id }),
  addDropdown: (kind: DropdownKind, name: string) =>
    postJson<DropdownItem>({ action: 'addDropdown', kind, name }),
  deleteDropdown: (kind: DropdownKind, id: string) =>
    postJson<{ ok: true }>({ action: 'deleteDropdown', kind, id }),
};

// ---------- Public API: try remote, fall back to local ----------

async function withFallback<T>(
  remote: () => Promise<T>,
  local: () => Promise<T>,
): Promise<T> {
  if (currentMode === 'local' || !REMOTE_CONFIGURED) return local();
  try {
    const result = await remote();
    if (currentMode !== 'remote') setMode('remote');
    return result;
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    setMode('local', reason);
    return local();
  }
}

export const api = {
  bootstrap: () => withFallback(remoteApi.bootstrap, localApi.bootstrap),
  createTask: (task: TaskInput) =>
    withFallback(() => remoteApi.createTask(task), () => localApi.createTask(task)),
  updateTask: (id: string, patch: Partial<TaskInput>) =>
    withFallback(() => remoteApi.updateTask(id, patch), () => localApi.updateTask(id, patch)),
  updateStatus: (id: string, status: Status) =>
    withFallback(() => remoteApi.updateStatus(id, status), () => localApi.updateStatus(id, status)),
  deleteTask: (id: string) =>
    withFallback(() => remoteApi.deleteTask(id), () => localApi.deleteTask(id)),
  addDropdown: (kind: DropdownKind, name: string) =>
    withFallback(() => remoteApi.addDropdown(kind, name), () => localApi.addDropdown(kind, name)),
  deleteDropdown: (kind: DropdownKind, id: string) =>
    withFallback(() => remoteApi.deleteDropdown(kind, id), () => localApi.deleteDropdown(kind, id)),
};

export function retryRemote(): void {
  if (!REMOTE_CONFIGURED) return;
  setMode('remote', undefined);
}

export function clearLocalData(): void {
  localApi.reset();
}

export const isRemoteConfigured = REMOTE_CONFIGURED;
