export interface FoodEntry {
  name: string;
  calories: number;
  qty: number;
}

export interface BeverageEntry {
  name: string;
  calories: number;
  qty: number;
}

export interface ExerciseEntry {
  name: string;
  caloriesBurned: number;
  hours: number | null;
}

export interface DayEntry {
  foods: FoodEntry[];
  beverages: BeverageEntry[];
  exercises: ExerciseEntry[];
  metamucil: boolean;
  exercised: boolean;
  nap: boolean;
  headache: boolean;
  mood: number | null;
  stomach: number | null;
  energy: number | null;
  anxiety: number | null;
  stress: number | null;
  bathroomTrips: number;
  weight: number | null;
  sleepHours: number | null;
  notes: string;
}

export interface JournalData {
  calorieGoal: number | null;
  days: Record<string, DayEntry>;
  foodPresets: FoodEntry[];
  beveragePresets: BeverageEntry[];
  exercisePresets: ExerciseEntry[];
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
    beverages: [],
    exercises: [],
    metamucil: false,
    exercised: false,
    nap: false,
    headache: false,
    mood: null,
    stomach: null,
    energy: null,
    anxiety: null,
    stress: null,
    bathroomTrips: 0,
    weight: null,
    sleepHours: null,
    notes: '',
  };
}

export function emptyJournal(): JournalData {
  return { calorieGoal: null, days: {}, foodPresets: [], beveragePresets: [], exercisePresets: [] };
}

// Fill defaults and migrate legacy field names (e.g. tired -> energy)
export function normalizeDay(raw: Partial<DayEntry> & { tired?: number | null }): DayEntry {
  const base = emptyDay();
  return {
    ...base,
    ...raw,
    foods: (raw.foods ?? []).map((f) => ({
      name: f.name ?? '',
      calories: f.calories ?? 0,
      qty: (f as FoodEntry).qty ?? 1,
    })),
    beverages: ((raw as DayEntry).beverages ?? []).map((b: BeverageEntry) => ({
      name: b.name ?? '',
      calories: b.calories ?? 0,
      qty: b.qty ?? 1,
    })),
    exercises: (raw.exercises ?? []).map((e) => ({
      name: e.name ?? '',
      caloriesBurned: e.caloriesBurned ?? 0,
      hours: e.hours ?? null,
    })),
    energy: raw.energy ?? raw.tired ?? null,
    sleepHours: raw.sleepHours ?? null,
  };
}

export function normalizeJournal(raw: Partial<JournalData>): JournalData {
  const days: Record<string, DayEntry> = {};
  for (const [k, v] of Object.entries(raw.days ?? {})) {
    days[k] = normalizeDay(v);
  }
  return {
    calorieGoal: raw.calorieGoal ?? null,
    days,
    foodPresets: raw.foodPresets ?? [],
    beveragePresets: raw.beveragePresets ?? [],
    exercisePresets: raw.exercisePresets ?? [],
  };
}

export function todayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
