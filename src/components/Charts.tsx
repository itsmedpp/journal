import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { JournalData, todayKey } from '../types';

interface Props {
  data: JournalData;
  range: number;
}

function lastDays(n: number): string[] {
  const out: string[] = [];
  const d = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const t = new Date(d);
    t.setDate(d.getDate() - i);
    out.push(todayKey(t));
  }
  return out;
}

function shortLabel(key: string, compact: boolean): string {
  return compact ? key.slice(8) : key.slice(5).replace('-', '/');
}

const axisStyle = { fill: '#9aa0ad', fontSize: 12 };
const gridStroke = '#333a45';
const tooltipStyle = {
  contentStyle: { background: '#23272f', border: '1px solid #333a45', borderRadius: 8 },
  labelStyle: { color: '#e6e8ec' },
};

export function Charts({ data, range }: Props) {
  const keys = lastDays(range);
  const compact = range > 7;
  const lbl = (k: string) => shortLabel(k, compact);
  const intv = compact ? 2 : 0;
  const barSize = compact ? 8 : 24;

  const weightRows = keys.map((k) => {
    const d = data.days[k];
    return { day: lbl(k), weight: d?.weight ?? null, exercised: d && d.exercises.length > 0 ? 1 : 0 };
  });

  const calRows = keys.map((k) => {
    const d = data.days[k];
    const inCal = d
      ? d.foods.reduce((s, f) => s + (f.caloriesPerServing || 0) * (f.qty || 1), 0)
        + d.beverages.reduce((s, b) => s + (b.caloriesPerServing || 0) * (b.qty || 1), 0)
      : 0;
    const outCal = d ? d.exercises.reduce((s, e) => s + (e.caloriesBurned || 0), 0) : 0;
    return { day: lbl(k), 'Calories in': inCal, Burned: outCal };
  });

  const moodEnergyRows = keys.map((k) => {
    const d = data.days[k];
    return { day: lbl(k), Mood: d?.mood ?? null, Energy: d?.energy ?? null };
  });

  const anxStressRows = keys.map((k) => {
    const d = data.days[k];
    return { day: lbl(k), Anxiety: d?.anxiety ?? null, Stress: d?.stress ?? null };
  });

  const stomachRows = keys.map((k) => {
    const d = data.days[k];
    return { day: lbl(k), 'Stomach Ache': d?.stomach ?? null, Headache: d?.headache ?? null };
  });

  const sleepRows = keys.map((k) => ({
    day: lbl(k),
    'Sleep hours': data.days[k]?.sleepHours ?? null,
  }));

  return (
    <div className="charts">
      <section className="card">
        <h3>Weight &amp; Workouts — last {range} days</h3>
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={weightRows}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="day" tick={axisStyle} interval={intv} />
            <YAxis yAxisId="w" domain={[150, 300]} tick={axisStyle} />
            <YAxis yAxisId="e" orientation="right" domain={[0, 1]} tick={false} width={10} />
            <Tooltip {...tooltipStyle} />
            <Legend />
            <Bar yAxisId="e" dataKey="exercised" name="Worked out" fill="#3d9e6b" fillOpacity={0.35} barSize={barSize} />
            <Line yAxisId="w" type="monotone" dataKey="weight" name="Weight" stroke="#6f9bff" strokeWidth={2} connectNulls dot={{ r: 3 }} />
            {data.weightGoal != null && (
              <ReferenceLine
                yAxisId="w"
                y={data.weightGoal}
                stroke="#e05d5d"
                strokeDasharray="6 4"
                label={{ value: `Goal ${data.weightGoal}`, position: 'insideTopRight', fill: '#e05d5d' }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </section>

      <section className="card">
        <h3>Calories — last {range} days</h3>
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={calRows}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="day" tick={axisStyle} interval={intv} />
            <YAxis tick={axisStyle} />
            <Tooltip {...tooltipStyle} />
            <Legend />
            <Bar dataKey="Calories in" fill="#6f9bff" barSize={barSize} />
            <Bar dataKey="Burned" fill="#f2a93b" barSize={barSize} />
            {data.calorieGoal != null && (
              <ReferenceLine
                y={data.calorieGoal}
                stroke="#e05d5d"
                strokeDasharray="6 4"
                label={{ value: `Goal ${data.calorieGoal}`, position: 'insideTopRight', fill: '#e05d5d' }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </section>

      <section className="card">
        <h3>Mood &amp; Energy — last {range} days <span className="hint">(1 = low, 5 = high)</span></h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={moodEnergyRows}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="day" tick={axisStyle} interval={intv} />
            <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tick={axisStyle} />
            <Tooltip {...tooltipStyle} />
            <Legend />
            <Line type="monotone" dataKey="Mood" stroke="#6f9bff" strokeWidth={2} connectNulls dot={{ r: 2 }} />
            <Line type="monotone" dataKey="Energy" stroke="#f2a93b" strokeWidth={2} connectNulls dot={{ r: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      </section>

      <section className="card">
        <h3>Anxiety &amp; Stress — last {range} days <span className="hint">(1 = low, 5 = high)</span></h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={anxStressRows}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="day" tick={axisStyle} interval={intv} />
            <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tick={axisStyle} />
            <Tooltip {...tooltipStyle} />
            <Legend />
            <Line type="monotone" dataKey="Anxiety" stroke="#e05d9e" strokeWidth={2} connectNulls dot={{ r: 2 }} />
            <Line type="monotone" dataKey="Stress" stroke="#b35de0" strokeWidth={2} connectNulls dot={{ r: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      </section>

      <section className="card">
        <h3>Stomach Ache &amp; Headache — last {range} days <span className="hint">(0 = none, 5 = severe)</span></h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={stomachRows}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="day" tick={axisStyle} interval={intv} />
            <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tick={axisStyle} />
            <Tooltip {...tooltipStyle} />
            <Legend />
            <Line type="monotone" dataKey="Stomach Ache" stroke="#3d9e6b" strokeWidth={2} connectNulls dot={{ r: 2 }} />
            <Line type="monotone" dataKey="Headache" stroke="#e05d5d" strokeWidth={2} connectNulls dot={{ r: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      </section>

      <section className="card">
        <h3>Sleep — last {range} days</h3>
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={sleepRows}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="day" tick={axisStyle} interval={intv} />
            <YAxis domain={[0, 12]} tick={axisStyle} />
            <Tooltip {...tooltipStyle} />
            <Legend />
            <Bar dataKey="Sleep hours" fill="#9b7bff" barSize={barSize} />
          </ComposedChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}
