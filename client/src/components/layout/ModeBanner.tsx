import { CheckCircle2, Database, Info, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useApiMode } from '../../hooks/useApiMode';
import {
  clearLocalData,
  isRemoteConfigured,
  retryRemote,
} from '../../api/client';
import { BOOTSTRAP_KEY } from '../../hooks/useTasks';
import { ConfirmDialog } from '../ui/ConfirmDialog';

export function ModeBanner() {
  const { mode, reason } = useApiMode();
  const qc = useQueryClient();
  const [resetOpen, setResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleRetry = () => {
    retryRemote();
    qc.invalidateQueries({ queryKey: BOOTSTRAP_KEY });
  };

  const handleRefresh = () => {
    qc.invalidateQueries({ queryKey: BOOTSTRAP_KEY });
  };

  const handleResetLocal = () => {
    setResetting(true);
    clearLocalData();
    qc.invalidateQueries({ queryKey: BOOTSTRAP_KEY });
    setResetting(false);
    setResetOpen(false);
  };

  if (mode === 'remote') {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
        <CheckCircle2 className="h-4 w-4" />
        <span>Connected to your Google Sheet.</span>
        <button
          onClick={handleRefresh}
          className="ml-auto inline-flex items-center gap-1 rounded-md border border-emerald-300 bg-white px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
          aria-label="Refresh data from API server"
        >
          <RefreshCw className="h-3 w-3" /> Refresh
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
        <Database className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="flex-1">
          <div className="font-semibold">
            Local mode — data is stored in this browser only.
          </div>
          {reason ? (
            <div className="mt-0.5 flex items-start gap-1 text-amber-700">
              <Info className="mt-0.5 h-3 w-3 shrink-0" />
              <span className="line-clamp-2">{reason}</span>
            </div>
          ) : null}
          {!isRemoteConfigured && (
            <div className="mt-0.5 text-amber-700">
              Start the API server (<code className="rounded bg-amber-100 px-1 py-0.5">npm run dev</code>{' '}
              from the repo root) and configure{' '}
              <code className="rounded bg-amber-100 px-1 py-0.5">server/.env</code> with your{' '}
              <code className="rounded bg-amber-100 px-1 py-0.5">SHEET_ID</code> to connect to your
              Google Sheet.
            </div>
          )}
        </div>
        <div className="ml-auto flex shrink-0 gap-1">
          {isRemoteConfigured && (
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-1 rounded-md border border-amber-300 bg-white px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100"
            >
              <RefreshCw className="h-3 w-3" /> Retry API
            </button>
          )}
          <button
            onClick={() => setResetOpen(true)}
            className="inline-flex items-center gap-1 rounded-md border border-amber-300 bg-white px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100"
          >
            Reset local data
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={resetOpen}
        title="Reset local data?"
        message="This wipes any tasks you created in local mode and reloads the demo data. Anything stored in the Google Sheet is unaffected."
        confirmLabel="Reset"
        loading={resetting}
        onConfirm={handleResetLocal}
        onCancel={() => setResetOpen(false)}
      />
    </>
  );
}
