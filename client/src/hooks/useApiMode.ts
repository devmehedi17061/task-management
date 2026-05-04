import { useEffect, useState } from 'react';
import {
  getApiMode,
  getApiModeReason,
  subscribeApiMode,
  type ApiMode,
} from '../api/client';

export function useApiMode(): { mode: ApiMode; reason?: string } {
  const [state, setState] = useState<{ mode: ApiMode; reason?: string }>(() => ({
    mode: getApiMode(),
    reason: getApiModeReason(),
  }));
  useEffect(() => subscribeApiMode((mode, reason) => setState({ mode, reason })), []);
  return state;
}
