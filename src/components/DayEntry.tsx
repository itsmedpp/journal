import { BeverageEntry, DayEntry as Day, ExerciseEntry, FoodEntry } from '../types';

interface Props {
  day: Day;
  foodPresets: FoodEntry[];
  beveragePresets: BeverageEntry[];
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

export function DayEntryForm({ day, foodPresets, beveragePresets, exercisePresets, onChange }: Props) {
  const set = (patch: Partial<Day>) => onChange({ ...day, ...patch });

  const updateFood = (i: number, key: 'name' | 'calories' | 'qty', v: string) => {
    const foods = day.foods.slice();
    const next = { ...foods[i] };
    if (key === 'name') {
      next.name = v;
      const preset = foodPresets.find((p) => p.name === v);
      if (preset) { next.calories = preset.calories; next.qty = preset.qty; }
    } else if (key === 'calories') {
      next.calories = Number(v) || 0;
    } else {
      next.qty = Number(v) || 1;
    }
    foods[i] = next;
    set({ foods });
  };

  const updateBeverage = (i: number, key: 'name' | 'calories' | 'qty', v: string) => {
    const beverages = day.beverages.slice();
    const next = { ...beverages[i] };
    if (key === 'name') {
      next.name = v;
      const preset = beveragePresets.find((p) => p.name === v);
      if (preset) { next.calories = preset.calories; next.qty = preset.qty; }
    } else if (key === 'calories') {
      next.calories = Number(v) || 0;
    } else {
      next.qty = Number(v) || 1;
    }
    beverages[i] = next;
    set({ beverages });
  };

  const updateExercise = (i: number, key: 'name' | 'caloriesBurned' | 'hours', v: string) => {
    const exercises = day.exercises.slice();
    const next = { ...exercises[i] };
    if (key === 'name') {
      next.name = v;
      const preset = exercisePresets.find((p) => p.name === v);
      if (preset) { next.caloriesBurned = preset.caloriesBurned; next.hours = preset.hours; }
    } else if (key === 'caloriesBurned') {
      next.caloriesBurned = Number(v) || 0;
    } else {
      next.hours = v === '' ? null : Number(v) || 0;
    }
    exercises[i] = next;
    set({ exercises });
  };

  const calIn = day.foods.reduce((s, f) => s + (f.calories || 0) * (f.qty || 1), 0)
    + day.beverages.reduce((s, b) => s + (b.calories || 0) * (b.qty || 1), 0);
  const calOut = day.exercises.reduce((s, e) => s + (e.caloriesBurned || 0), 0);

  return (
    <div className="day-form">
      {/* SUMMARY — Totals + Weight */}
      <section className="card summary-row">
        <div className="total"><span>Calories in</span><strong>{calIn}</strong></div>
        <div className="total"><span>Calories burned</span><strong>{calOut}</strong></div>
        <div className="total"><span>Net</span><strong>{calIn - calOut}</strong></div>
        <label className="weight-inline">
          Weight
          <input type="number" step="0.1" min={0} value={day.weight ?? ''} onChange={(e) => set({ weight: e.target.value === '' ? null : Number(e.target.value) })} />
        </label>
      </section>

      {/* FOOD */}
      <section className="card">
        <div className="card-header">
          <h3>Food</h3>
          <button type="button" className="btn small" onClick={() => set({ foods: [...day.foods, { name: '', calories: 0, qty: 1 }] })}>
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
              className="num-sm"
              type="number"
              min={1}
              placeholder="Qty"
              value={f.qty || ''}
              onChange={(e) => updateFood(i, 'qty', e.target.value)}
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
          {foodPresets.map((p) => <option key={p.name} value={p.name} />)}
        </datalist>
      </section>

      {/* BEVERAGES */}
      <section className="card">
        <div className="card-header">
          <h3>Beverages</h3>
          <button type="button" className="btn small" onClick={() => set({ beverages: [...day.beverages, { name: '', calories: 0, qty: 1 }] })}>
            + Add beverage
          </button>
        </div>
        {day.beverages.length === 0 && <p className="hint">No beverage entries yet.</p>}
        {day.beverages.map((b, i) => (
          <div className="row" key={i}>
            <input
              className="grow"
              placeholder="Beverage name"
              list="beverage-presets"
              value={b.name}
              onChange={(e) => updateBeverage(i, 'name', e.target.value)}
            />
            <input
              className="num-sm"
              type="number"
              min={1}
              placeholder="Qty"
              value={b.qty || ''}
              onChange={(e) => updateBeverage(i, 'qty', e.target.value)}
            />
            <input
              className="num"
              type="number"
              min={0}
              placeholder="Cal"
              value={b.calories || ''}
              onChange={(e) => updateBeverage(i, 'calories', e.target.value)}
            />
            <button type="button" className="btn icon" onClick={() => set({ beverages: day.beverages.filter((_, j) => j !== i) })}>
              ×
            </button>
          </div>
        ))}
        <datalist id="beverage-presets">
          {beveragePresets.map((p) => <option key={p.name} value={p.name} />)}
        </datalist>
      </section>

      {/* EXERCISE */}
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
          {exercisePresets.map((p) => <option key={p.name} value={p.name} />)}
        </datalist>
      </section>

      {/* CHECKBOXES */}
      <section className="card">
        <label className="check">
          <input type="checkbox" checked={day.metamucil} onChange={(e) => set({ metamucil: e.target.checked })} />
          Metamucil
        </label>
        <label className="check">
          <input type="checkbox" checked={day.nap} onChange={(e) => set({ nap: e.target.checked })} />
          Nap
        </label>
        <label className="check">
          <input type="checkbox" checked={day.headache} onChange={(e) => set({ headache: e.target.checked })} />
          Headache
        </label>
      </section>

      {/* RATINGS — Mood & Energy (1 = low, 5 = high) */}
      <section className="card">
        <h3 className="rating-group-title">Mood &amp; Energy <span className="hint">(1 = low, 5 = high)</span></h3>
        <Rating label="Mood" value={day.mood} onChange={(v) => set({ mood: v })} />
        <Rating label="Energy" value={day.energy} onChange={(v) => set({ energy: v })} />
      </section>

      {/* RATINGS — Anxiety & Stress (1 = low, 5 = high) */}
      <section className="card">
        <h3 className="rating-group-title">Anxiety &amp; Stress <span className="hint">(1 = low, 5 = high)</span></h3>
        <Rating label="Anxiety" value={day.anxiety} onChange={(v) => set({ anxiety: v })} />
        <Rating label="Stress" value={day.stress} onChange={(v) => set({ stress: v })} />
      </section>

      {/* RATINGS — Stomach (1 = good, 5 = bad) */}
      <section className="card">
        <h3 className="rating-group-title">Stomach <span className="hint">(1 = good, 5 = bad)</span></h3>
        <Rating label="Stomach" value={day.stomach} onChange={(v) => set({ stomach: v })} />
      </section>

      {/* NUMBER INPUTS */}
      <section className="card inline-fields">
        <label className="inline-field">
          Bathroom trips
          <input className="num-sm" type="number" min={0} value={day.bathroomTrips || ''} onChange={(e) => set({ bathroomTrips: Number(e.target.value) || 0 })} />
        </label>
        <label className="inline-field">
          Sleep hours
          <input className="num-sm" type="number" step="0.5" min={0} max={24} value={day.sleepHours ?? ''} onChange={(e) => set({ sleepHours: e.target.value === '' ? null : Number(e.target.value) })} />
        </label>
      </section>

      {/* NOTES */}
      <section className="card">
        <label>
          Notes
          <textarea rows={4} value={day.notes} onChange={(e) => set({ notes: e.target.value })} placeholder="How was today?" />
        </label>
      </section>
    </div>
  );
}
