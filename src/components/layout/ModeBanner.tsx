import { CheckCircle2, Database, Info, RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useApiMode } from '../../hooks/useApiMode';
import {
  clearLocalData,
  isRemoteConfigured,
  retryRemote,
} from '../../api/client';
import { BOOTSTRAP_KEY } from '../../hooks/useTasks';

export function ModeBanner() {
  const { mode, reason } = useApiMode();
  const qc = useQueryClient();

  const handleRetry = () => {
    retryRemote();
    qc.invalidateQueries({ queryKey: BOOTSTRAP_KEY });
  };

  const handleResetLocal = () => {
    if (
      window.confirm(
        'Reset local data? This wipes any tasks you created in local mode and reloads the demo data.',
      )
    ) {
      clearLocalData();
      qc.invalidateQueries({ queryKey: BOOTSTRAP_KEY });
    }
  };

  if (mode === 'remote') {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
        <CheckCircle2 className="h-4 w-4" />
        <span>Connected to your Google Sheet.</span>
      </div>
    );
  }

  return (
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
            Set <code className="rounded bg-amber-100 px-1 py-0.5">VITE_APPS_SCRIPT_URL</code> in
            <code className="ml-1 rounded bg-amber-100 px-1 py-0.5">.env.local</code> and restart{' '}
            <code className="rounded bg-amber-100 px-1 py-0.5">npm run dev</code> to connect to
            your sheet.
          </div>
        )}
      </div>
      <div className="ml-auto flex shrink-0 gap-1">
        {isRemoteConfigured && (
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-1 rounded-md border border-amber-300 bg-white px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100"
          >
            <RefreshCw className="h-3 w-3" /> Retry sheet
          </button>
        )}
        <button
          onClick={handleResetLocal}
          className="inline-flex items-center gap-1 rounded-md border border-amber-300 bg-white px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100"
        >
          Reset local data
        </button>
      </div>
    </div>
  );
}
