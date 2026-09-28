import { DayEntry as Day, ExerciseEntry, FoodEntry } from '../types';

interface Props {
  day: Day;
  foodPresets: FoodEntry[];
  exercisePresets: ExerciseEntry[];
  onChange: (d: Day) => void;
}

function Rating({ label, value, onChange }: { label: string; value: number | null; onChange: (v: number | null) => void }) {
  return (
    <div className="rating">
      <span className="rating-label">{label}</span>
      <div className="rating-buttons">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className={`rating-btn ${value === n ? 'active' : ''}`}
            onClick={() => onChange(value === n ? null : n)}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

export function DayEntryForm({ day, foodPresets, exercisePresets, onChange }: Props) {
  const set = (patch: Partial<Day>) => onChange({ ...day, ...patch });

  const updateFood = (i: number, key: 'name' | 'calories', v: string) => {
    const foods = day.foods.slice();
    foods[i] = { ...foods[i], [key]: key === 'calories' ? Number(v) || 0 : v };
    if (key === 'name') {
      const preset = foodPresets.find((p) => p.name === v);
      if (preset) foods[i].calories = preset.calories;
    }
    set({ foods });
  };
  const updateExercise = (i: number, key: 'name' | 'caloriesBurned' | 'hours', v: string) => {
    const exercises = day.exercises.slice();
    const next = { ...exercises[i] };
    if (key === 'name') next.name = v;
    else if (key === 'caloriesBurned') next.caloriesBurned = Number(v) || 0;
    else next.hours = v === '' ? null : Number(v) || 0;
    if (key === 'name') {
      const preset = exercisePresets.find((p) => p.name === v);
      if (preset) {
        next.caloriesBurned = preset.caloriesBurned;
        next.hours = preset.hours;
      }
    }
    exercises[i] = next;
    set({ exercises });
  };

  const calIn = day.foods.reduce((s, f) => s + (f.calories || 0), 0);
  const calOut = day.exercises.reduce((s, e) => s + (e.caloriesBurned || 0), 0);

  return (
    <div className="day-form">
      <section className="card">
        <div className="card-header">
          <h3>Food</h3>
          <button type="button" className="btn small" onClick={() => set({ foods: [...day.foods, { name: '', calories: 0 }] })}>
            + Add food
          </button>
        </div>
        {day.foods.length === 0 && <p className="hint">No food entries yet.</p>}
        {day.foods.map((f, i) => (
          <div className="row" key={i}>
            <input
              className="grow"
              placeholder="Food name"
              list="food-presets"
              value={f.name}
              onChange={(e) => updateFood(i, 'name', e.target.value)}
            />
            <input
              className="num"
              type="number"
              min={0}
              placeholder="Cal"
              value={f.calories || ''}
              onChange={(e) => updateFood(i, 'calories', e.target.value)}
            />
            <button type="button" className="btn icon" onClick={() => set({ foods: day.foods.filter((_, j) => j !== i) })}>
              ×
            </button>
          </div>
        ))}
        <datalist id="food-presets">
          {foodPresets.map((p) => (
            <option key={p.name} value={p.name} />
          ))}
        </datalist>
      </section>

      <section className="card">
        <div className="card-header">
          <h3>Exercise</h3>
          <button type="button" className="btn small" onClick={() => set({ exercises: [...day.exercises, { name: '', caloriesBurned: 0, hours: null }] })}>
            + Add exercise
          </button>
        </div>
        {day.exercises.length === 0 && <p className="hint">No exercise entries yet.</p>}
        {day.exercises.map((ex, i) => (
          <div className="row" key={i}>
            <input
              className="grow"
              placeholder="Exercise"
              list="exercise-presets"
              value={ex.name}
              onChange={(e) => updateExercise(i, 'name', e.target.value)}
            />
            <input
              className="num"
              type="number"
              min={0}
              step="0.25"
              placeholder="Hours"
              value={ex.hours ?? ''}
              onChange={(e) => updateExercise(i, 'hours', e.target.value)}
            />
            <input
              className="num"
              type="number"
              min={0}
              placeholder="Burned"
              value={ex.caloriesBurned || ''}
              onChange={(e) => updateExercise(i, 'caloriesBurned', e.target.value)}
            />
            <button type="button" className="btn icon" onClick={() => set({ exercises: day.exercises.filter((_, j) => j !== i) })}>
              ×
            </button>
          </div>
        ))}
        <datalist id="exercise-presets">
          {exercisePresets.map((p) => (
            <option key={p.name} value={p.name} />
          ))}
        </datalist>
      </section>

      <section className="card totals">
        <div className="total"><span>Calories in</span><strong>{calIn}</strong></div>
        <div className="total"><span>Calories burned</span><strong>{calOut}</strong></div>
        <div className="total"><span>Net</span><strong>{calIn - calOut}</strong></div>
      </section>

      <section className="card">
        <label className="check">
          <input
            type="checkbox"
            checked={day.metamucil}
            onChange={(e) => set({ metamucil: e.target.checked })}
          />
          Metamucil
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={day.exercised}
            onChange={(e) => set({ exercised: e.target.checked })}
          />
          Exercised
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={day.nap}
            onChange={(e) => set({ nap: e.target.checked })}
          />
          Nap
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={day.headache}
            onChange={(e) => set({ headache: e.target.checked })}
          />
          Headache
        </label>
      </section>

      <section className="card">
        <Rating label="Mood" value={day.mood} onChange={(v) => set({ mood: v })} />
        <Rating label="Stomach" value={day.stomach} onChange={(v) => set({ stomach: v })} />
        <Rating label="Energy" value={day.energy} onChange={(v) => set({ energy: v })} />
        <Rating label="Anxiety" value={day.anxiety} onChange={(v) => set({ anxiety: v })} />
        <Rating label="Stress" value={day.stress} onChange={(v) => set({ stress: v })} />
      </section>

      <section className="card grid3">
        <label>
          Bathroom trips
          <input
            type="number"
            min={0}
            value={day.bathroomTrips || ''}
            onChange={(e) => set({ bathroomTrips: Number(e.target.value) || 0 })}
          />
        </label>
        <label>
          Weight
          <input
            type="number"
            step="0.1"
            min={0}
            value={day.weight ?? ''}
            onChange={(e) => set({ weight: e.target.value === '' ? null : Number(e.target.value) })}
          />
        </label>
        <label>
          Sleep hours
          <input
            type="number"
            step="0.5"
            min={0}
            max={24}
            value={day.sleepHours ?? ''}
            onChange={(e) => set({ sleepHours: e.target.value === '' ? null : Number(e.target.value) })}
          />
        </label>
      </section>

      <section className="card">
        <label>
          Notes
          <textarea
            rows={4}
            value={day.notes}
            onChange={(e) => set({ notes: e.target.value })}
            placeholder="How was today?"
          />
        </label>
      </section>
    </div>
  );
}
