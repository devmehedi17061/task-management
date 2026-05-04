import type {
  BootstrapResponse,
  DropdownItem,
  DropdownKind,
  Status,
  Task,
  TaskInput,
} from '../lib/types';
import { localApi } from './localApi';

// In dev, the Vite proxy forwards /api → http://localhost:4000 (Express).
// In a production build the same /api path needs a real backend behind it
// (e.g. Vercel serverless rewrite). Set VITE_API_BASE=/api at build time to
// enable remote mode in production. The GitHub Pages build leaves it unset,
// so the deployed site runs in local-storage-only mode.
const API_BASE: string = import.meta.env.DEV
  ? '/api'
  : ((import.meta.env.VITE_API_BASE as string | undefined) ?? '');

const REMOTE_CONFIGURED = Boolean(API_BASE);

// ---------- Mode tracking ----------

export type ApiMode = 'remote' | 'local';
type ModeListener = (mode: ApiMode, reason?: string) => void;

let currentMode: ApiMode = REMOTE_CONFIGURED ? 'remote' : 'local';
let lastReason: string | undefined = REMOTE_CONFIGURED
  ? undefined
  : 'No API server configured for this build.';
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

// ---------- Remote (Node API) ----------

// Transport errors mean the API server is unreachable (offline, dev server
// not running, network down). Falling back to local mode is the right move.
//
// Remote app errors mean the server responded but rejected this specific
// operation (e.g. "Task not found"). The connection is healthy — surface the
// error to the caller and resync, NOT switch to local mode.
class TransportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TransportError';
  }
}

class RemoteAppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RemoteAppError';
  }
}

async function parseResponse<T>(res: Response): Promise<T> {
  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new TransportError(`Could not parse response as JSON (status ${res.status})`);
  }
  if (!res.ok) {
    const msg =
      json && typeof json === 'object' && 'error' in json && (json as { error?: string }).error
        ? String((json as { error: string }).error)
        : `Request failed: ${res.status}`;
    // 4xx with a JSON error body = app-level rejection (validation, not found).
    // 5xx = server reachable but broken — surface it as a transport-style error
    // so the UI falls back to local mode rather than masking infra problems.
    if (res.status >= 400 && res.status < 500) throw new RemoteAppError(msg);
    throw new TransportError(msg);
  }
  return json as T;
}

async function fetchOrTransportError(input: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch (err) {
    throw new TransportError(err instanceof Error ? err.message : String(err));
  }
}

function url(path: string): string {
  if (!REMOTE_CONFIGURED) {
    throw new Error('API base is not configured for this build.');
  }
  return `${API_BASE}${path}`;
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetchOrTransportError(url(path), { method: 'GET' });
  return parseResponse<T>(res);
}

async function sendJson<T>(method: 'POST' | 'PATCH' | 'DELETE', path: string, body?: unknown): Promise<T> {
  const init: RequestInit = {
    method,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  };
  const res = await fetchOrTransportError(url(path), init);
  return parseResponse<T>(res);
}

const remoteApi = {
  bootstrap: () => getJson<BootstrapResponse>('/bootstrap'),
  createTask: (task: TaskInput) =>
    sendJson<{ task: Task }>('POST', '/tasks', task).then((r) => r.task),
  updateTask: (id: string, patch: Partial<TaskInput>) =>
    sendJson<{ task: Task }>('PATCH', `/tasks/${encodeURIComponent(id)}`, patch).then((r) => r.task),
  updateStatus: (id: string, status: Status) =>
    sendJson<{ ok: true }>('PATCH', `/tasks/${encodeURIComponent(id)}/status`, { status }),
  deleteTask: (id: string) =>
    sendJson<{ ok: true }>('DELETE', `/tasks/${encodeURIComponent(id)}`),
  addDropdown: (kind: DropdownKind, name: string) =>
    sendJson<DropdownItem>('POST', `/dropdowns/${kind}`, { name }),
  deleteDropdown: (kind: DropdownKind, id: string) =>
    sendJson<{ ok: true }>('DELETE', `/dropdowns/${kind}/${encodeURIComponent(id)}`),
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
    // App-level errors (e.g. validation, "not found") mean the server is
    // reachable — surface them to the caller instead of silently falling
    // back to local mode. The caller (a TanStack Query mutation) can then
    // refetch to resync the cache with the actual sheet state.
    if (err instanceof RemoteAppError) {
      throw err;
    }
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
