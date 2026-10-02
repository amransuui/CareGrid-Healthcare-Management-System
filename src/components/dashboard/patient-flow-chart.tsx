import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { PatientFlowDay } from '@/types/dashboard'

function FlowTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: readonly { name?: string; value?: number; color?: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border bg-background px-3 py-2 text-xs shadow-card">
      <p className="mb-1 font-medium">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="flex items-center gap-2">
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: entry.color }}
            aria-hidden="true"
          />
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  )
}

/** 7-day admissions vs discharges bar chart with a text legend. */
export function PatientFlowChart({ data }: { data: PatientFlowDay[] }) {
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-4">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="size-2 rounded-full bg-sky-500" aria-hidden="true" />
          Admitted
        </span>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span
            className="size-2 rounded-full bg-indigo-400"
            aria-hidden="true"
          />
          Discharged
        </span>
      </div>
      <div
        className="h-60"
        role="img"
        aria-label="Inpatient flow over the last 7 days. Admissions are highest on Thursday and lowest on Saturday; discharges stay between 12 and 19 per day."
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
            barGap={4}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
              axisLine={false}
              tickLine={false}
              dy={6}
            />
            <YAxis
              tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
              content={<FlowTooltip />}
            />
            <Bar
              dataKey="admitted"
              name="Admitted"
              fill="var(--chart-1)"
              radius={[3, 3, 0, 0]}
              maxBarSize={26}
            />
            <Bar
              dataKey="discharged"
              name="Discharged"
              fill="var(--chart-2)"
              radius={[3, 3, 0, 0]}
              maxBarSize={26}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}