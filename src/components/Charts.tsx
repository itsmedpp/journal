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
}

function last7Days(): string[] {
  const out: string[] = [];
  const d = new Date();
  for (let i = 6; i >= 0; i--) {
    const t = new Date(d);
    t.setDate(d.getDate() - i);
    out.push(todayKey(t));
  }
  return out;
}

function shortLabel(key: string): string {
  return key.slice(5).replace('-', '/');
}

export function Charts({ data }: Props) {
  const keys = last7Days();

  const weightRows = keys.map((k) => {
    const d = data.days[k];
    return {
      day: shortLabel(k),
      weight: d?.weight ?? null,
      exercised: d?.exercised ? 1 : 0,
    };
  });

  const calRows = keys.map((k) => {
    const d = data.days[k];
    const inCal = d ? d.foods.reduce((s, f) => s + (f.calories || 0), 0) : 0;
    const outCal = d ? d.exercises.reduce((s, e) => s + (e.caloriesBurned || 0), 0) : 0;
    return { day: shortLabel(k), 'Calories in': inCal, 'Burned': outCal };
  });

  const ratingRows = keys.map((k) => {
    const d = data.days[k];
    return {
      day: shortLabel(k),
      Mood: d?.mood ?? null,
      Stomach: d?.stomach ?? null,
      Tired: d?.tired ?? null,
    };
  });

  return (
    <div className="charts">
      <section className="card">
        <h3>Weight &amp; Workouts — last 7 days</h3>
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={weightRows}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis yAxisId="w" domain={['auto', 'auto']} />
            <YAxis yAxisId="e" orientation="right" domain={[0, 1]} tick={false} width={10} />
            <Tooltip />
            <Legend />
            <Bar
              yAxisId="e"
              dataKey="exercised"
              name="Worked out"
              fill="#82ca9d"
              fillOpacity={0.35}
              barSize={24}
            />
            <Line
              yAxisId="w"
              type="monotone"
              dataKey="weight"
              name="Weight"
              stroke="#4f7cff"
              strokeWidth={2}
              connectNulls
              dot={{ r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </section>

      <section className="card">
        <h3>Calories — last 7 days</h3>
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={calRows}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Calories in" fill="#4f7cff" barSize={20} />
            <Bar dataKey="Burned" fill="#f2a93b" barSize={20} />
            {data.calorieGoal != null && (
              <ReferenceLine
                y={data.calorieGoal}
                stroke="#d64545"
                strokeDasharray="6 4"
                label={{ value: `Goal ${data.calorieGoal}`, position: 'insideTopRight', fill: '#d64545' }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </section>

      <section className="card">
        <h3>Ratings — last 7 days</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={ratingRows}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Mood" stroke="#4f7cff" strokeWidth={2} connectNulls />
            <Line type="monotone" dataKey="Stomach" stroke="#82ca9d" strokeWidth={2} connectNulls />
            <Line type="monotone" dataKey="Tired" stroke="#f2a93b" strokeWidth={2} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}
