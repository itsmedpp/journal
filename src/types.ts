export interface FoodEntry {
  name: string;
  calories: number;
}

export interface ExerciseEntry {
  name: string;
  caloriesBurned: number;
}

export interface DayEntry {
  foods: FoodEntry[];
  exercises: ExerciseEntry[];
  metamucil: boolean;
  exercised: boolean;
  mood: number | null;
  stomach: number | null;
  energy: number | null;
  bathroomTrips: number;
  weight: number | null;
  sleepHours: number | null;
  notes: string;
}

export interface JournalData {
  calorieGoal: number | null;
  days: Record<string, DayEntry>;
}

export interface Settings {
  token: string;
  owner: string;
  repo: string;
  path: string;
}

export function emptyDay(): DayEntry {
  return {
    foods: [],
    exercises: [],
    metamucil: false,
    exercised: false,
    mood: null,
    stomach: null,
    energy: null,
    bathroomTrips: 0,
    weight: null,
    sleepHours: null,
    notes: '',
  };
}

export function emptyJournal(): JournalData {
  return { calorieGoal: null, days: {} };
}

// Fill defaults and migrate legacy field names (e.g. tired -> energy)
export function normalizeDay(raw: Partial<DayEntry> & { tired?: number | null }): DayEntry {
  const base = emptyDay();
  return {
    ...base,
    ...raw,
    energy: raw.energy ?? raw.tired ?? null,
    sleepHours: raw.sleepHours ?? null,
  };
}

export function todayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
