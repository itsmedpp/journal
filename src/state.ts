import { useCallback, useEffect, useRef, useState } from 'react';
import { loadJournal, saveJournal } from './github';
import { emptyJournal, JournalData, normalizeJournal, Settings } from './types';

const SETTINGS_KEY = 'journal.settings';
const CACHE_KEY = 'journal.cache';

export type SyncStatus =
  | 'idle'
  | 'loading'
  | 'saving'
  | 'saved'
  | 'error'
  | 'offline';

export function loadSettings(): Settings | null {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Settings;
    if (!s.token || !s.owner || !s.repo) return null;
    return { ...s, path: s.path || 'journal.json' };
  } catch {
    return null;
  }
}

export function storeSettings(s: Settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

function loadCache(): JournalData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as JournalData;
    return normalizeJournal(parsed);
  } catch {
    return null;
  }
}

function storeCache(d: JournalData) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(d));
}

export function useJournal() {
  const [settings, setSettings] = useState<Settings | null>(loadSettings);
  const [data, setData] = useState<JournalData>(emptyJournal);
  const [status, setStatus] = useState<SyncStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const shaRef = useRef<string | null>(null);

  const refresh = useCallback(async (s: Settings) => {
    setStatus('loading');
    setError(null);
    try {
      const { data: d, sha } = await loadJournal(s);
      shaRef.current = sha;
      setData(d);
      storeCache(d);
      setStatus('idle');
    } catch (e) {
      const cached = loadCache();
      if (cached) {
        setData(cached);
        setStatus('offline');
      } else {
        setStatus('error');
      }
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  useEffect(() => {
    if (settings) void refresh(settings);
  }, [settings, refresh]);

  const save = useCallback(
    async (next: JournalData) => {
      setData(next);
      storeCache(next);
      if (!settings) {
        setStatus('offline');
        return;
      }
      setStatus('saving');
      setError(null);
      try {
        const sha = await saveJournal(settings, next, shaRef.current);
        shaRef.current = sha;
        setStatus('saved');
      } catch (e) {
        setStatus('error');
        setError(e instanceof Error ? e.message : String(e));
      }
    },
    [settings]
  );

  const saveSettings = useCallback(
    (s: Settings) => {
      storeSettings(s);
      shaRef.current = null;
      setSettings(s);
    },
    []
  );

  return { settings, data, status, error, refresh, save, saveSettings };
}
