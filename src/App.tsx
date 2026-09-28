import { useMemo, useState } from 'react';
import { Charts } from './components/Charts';
import { DayEntryForm } from './components/DayEntry';
import { SettingsPanel } from './components/Settings';
import { useJournal } from './state';
import { DayEntry, emptyDay, ExerciseEntry, FoodEntry, JournalData, todayKey } from './types';

function statusText(status: string, dirty: boolean): string {
  if (dirty) return 'Unsaved changes';
  switch (status) {
    case 'loading': return 'Loading…';
    case 'saving': return 'Saving…';
    case 'saved': return 'Saved';
    case 'offline': return 'Offline (cached)';
    case 'error': return 'Sync error';
    default: return '';
  }
}

export default function App() {
  const { settings, data, status, error, refresh, save, saveSettings } = useJournal();
  const [dateKey, setDateKey] = useState(todayKey());
  const [draft, setDraft] = useState<JournalData | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [range, setRange] = useState<7 | 30>(7);

  const current = draft ?? data;
  const dirty = draft !== null;

  const day: DayEntry = useMemo(
    () => current.days[dateKey] ?? emptyDay(),
    [current, dateKey]
  );

  const update = (patch: (j: JournalData) => JournalData) => {
    setDraft(patch(draft ?? data));
  };

  const setDay = (d: DayEntry) =>
    update((j) => ({ ...j, days: { ...j.days, [dateKey]: d } }));

  const setGoal = (v: number | null) =>
    update((j) => ({ ...j, calorieGoal: v }));

  const handleSave = async () => {
    if (!draft) return;
    // Collect any newly named food/exercise entries into reusable presets
    const foods = new Map<string, FoodEntry>();
    const exercises = new Map<string, ExerciseEntry>();
    for (const d of Object.values(draft.days)) {
      for (const f of d.foods) if (f.name.trim()) foods.set(f.name.trim(), f);
      for (const e of d.exercises) if (e.name.trim()) exercises.set(e.name.trim(), e);
    }
    const next: JournalData = {
      ...draft,
      foodPresets: [...draft.foodPresets.filter((p) => !foods.has(p.name)), ...foods.values()],
      exercisePresets: [...draft.exercisePresets.filter((p) => !exercises.has(p.name)), ...exercises.values()],
    };
    await save(next);
    setDraft(null);
  };

  const handleRefresh = async () => {
    if (!settings) return;
    setDraft(null);
    await refresh(settings);
  };

  const shiftDay = (n: number) => {
    const d = new Date(dateKey + 'T12:00:00');
    d.setDate(d.getDate() + n);
    setDateKey(todayKey(d));
  };

  const needSettings = !settings;

  return (
    <div className="app">
      <header className="topbar">
        <h1>Daily Journal</h1>
        <div className="topbar-controls">
          <div className="date-nav">
            <button type="button" className="btn secondary" onClick={() => shiftDay(-1)}>←</button>
            <input
              type="date"
              value={dateKey}
              onChange={(e) => e.target.value && setDateKey(e.target.value)}
            />
            <button type="button" className="btn secondary" onClick={() => shiftDay(1)}>→</button>
          </div>
          <label className="goal">
            Calorie goal
            <input
              type="number"
              min={0}
              value={current.calorieGoal ?? ''}
              onChange={(e) => setGoal(e.target.value === '' ? null : Number(e.target.value))}
            />
          </label>
          <span className={`status ${status} ${dirty ? 'dirty' : ''}`}>
            {statusText(status, dirty)}
          </span>
          <button type="button" className="btn" onClick={handleSave} disabled={!dirty || status === 'saving'}>
            Save
          </button>
          <button type="button" className="btn secondary" onClick={handleRefresh} disabled={!settings || status === 'loading'}>
            Sync
          </button>
          <button type="button" className="btn secondary" onClick={() => setShowSettings(true)}>
            Settings
          </button>
        </div>
        {error && <div className="error">{error}</div>}
      </header>

      {needSettings && !showSettings && (
        <div className="card notice">
          <p>Connect your GitHub repo to start journaling.</p>
          <button type="button" className="btn" onClick={() => setShowSettings(true)}>
            Open settings
          </button>
        </div>
      )}

      <main>
        <DayEntryForm
          day={day}
          foodPresets={current.foodPresets}
          exercisePresets={current.exercisePresets}
          onChange={setDay}
        />
        <div className="range-toggle">
          <span>History:</span>
          <button
            type="button"
            className={`btn small ${range === 7 ? '' : 'secondary'}`}
            onClick={() => setRange(7)}
          >
            7 days
          </button>
          <button
            type="button"
            className={`btn small ${range === 30 ? '' : 'secondary'}`}
            onClick={() => setRange(30)}
          >
            30 days
          </button>
        </div>
        <Charts data={current} range={range} />
      </main>

      {showSettings && (
        <SettingsPanel
          initial={settings}
          onSave={saveSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
