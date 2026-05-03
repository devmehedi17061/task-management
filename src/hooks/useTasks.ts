import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import type {
  BootstrapResponse,
  DropdownItem,
  DropdownKind,
  Status,
  Task,
  TaskInput,
} from '../lib/types';

export const BOOTSTRAP_KEY = ['bootstrap'] as const;

export function useBootstrap() {
  return useQuery({
    queryKey: BOOTSTRAP_KEY,
    queryFn: api.bootstrap,
    // Short stale time + window-focus refetch keeps the UI in sync with rows
    // added/edited/deleted directly inside the Google Sheet.
    staleTime: 5_000,
    refetchOnWindowFocus: true,
  });
}

function patchCache(
  qc: ReturnType<typeof useQueryClient>,
  updater: (data: BootstrapResponse) => BootstrapResponse,
) {
  qc.setQueryData<BootstrapResponse>(BOOTSTRAP_KEY, (prev) => (prev ? updater(prev) : prev));
}

// Whenever a mutation finishes (success OR error), we kick off a fresh
// bootstrap fetch so the UI re-syncs with the Google Sheet. This catches
// rows that were added/edited/deleted directly in the sheet, and recovers
// from "not found"-style mismatches without dropping into local mode.
const resync = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: BOOTSTRAP_KEY });
};

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TaskInput) => api.createTask(input),
    onSuccess: (task) => {
      patchCache(qc, (data) => ({ ...data, tasks: [...data.tasks, task] }));
    },
    onSettled: () => resync(qc),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<TaskInput> }) =>
      api.updateTask(id, patch),
    onSuccess: (task) => {
      patchCache(qc, (data) => ({
        ...data,
        tasks: data.tasks.map((t) => (t.id === task.id ? task : t)),
      }));
    },
    onSettled: () => resync(qc),
  });
}

export function useUpdateStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Status }) =>
      api.updateStatus(id, status),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: BOOTSTRAP_KEY });
      const prev = qc.getQueryData<BootstrapResponse>(BOOTSTRAP_KEY);
      patchCache(qc, (data) => ({
        ...data,
        tasks: data.tasks.map((t) => (t.id === id ? { ...t, status } : t)),
      }));
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(BOOTSTRAP_KEY, ctx.prev);
    },
    onSettled: () => resync(qc),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteTask(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: BOOTSTRAP_KEY });
      const prev = qc.getQueryData<BootstrapResponse>(BOOTSTRAP_KEY);
      patchCache(qc, (data) => ({
        ...data,
        tasks: data.tasks.filter((t) => t.id !== id),
      }));
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(BOOTSTRAP_KEY, ctx.prev);
    },
    onSettled: () => resync(qc),
  });
}

export function useAddDropdown() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ kind, name }: { kind: DropdownKind; name: string }) =>
      api.addDropdown(kind, name),
    onSuccess: (item, vars) => {
      patchCache(qc, (data) => ({
        ...data,
        [vars.kind]: [...(data[vars.kind] as DropdownItem[]), item],
      }));
    },
    onSettled: () => resync(qc),
  });
}

export function useDeleteDropdown() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ kind, id }: { kind: DropdownKind; id: string }) =>
      api.deleteDropdown(kind, id),
    onMutate: async ({ kind, id }) => {
      await qc.cancelQueries({ queryKey: BOOTSTRAP_KEY });
      const prev = qc.getQueryData<BootstrapResponse>(BOOTSTRAP_KEY);
      patchCache(qc, (data) => ({
        ...data,
        [kind]: (data[kind] as DropdownItem[]).filter((d) => d.id !== id),
      }));
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(BOOTSTRAP_KEY, ctx.prev);
    },
    onSettled: () => resync(qc),
  });
}

export type { Task };
