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
  tired: number | null;
  bathroomTrips: number;
  weight: number | null;
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
    tired: null,
    bathroomTrips: 0,
    weight: null,
    notes: '',
  };
}

export function emptyJournal(): JournalData {
  return { calorieGoal: null, days: {} };
}

export function todayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
