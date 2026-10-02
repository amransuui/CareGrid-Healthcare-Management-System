import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { WardStat } from '@/types/dashboard'

const SERIES = [
  { key: 'occupied', name: 'Occupied', color: 'var(--chart-1)' },
  { key: 'available', name: 'Available', color: 'var(--chart-5)' },
  { key: 'cleaning', name: 'Cleaning', color: 'var(--chart-4)' },
  { key: 'reserved', name: 'Reserved', color: 'var(--chart-3)' },
] as const

function WardTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: readonly { name?: string; value?: number; color?: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  const total = payload.reduce(
    (sum, entry) => sum + (entry.value ?? 0),
    0,
  )
  return (
    <div className="rounded-md border bg-background px-3 py-2 text-xs shadow-card">
      <p className="mb-1 font-medium">
        {label} · {total} beds
      </p>
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

/** Stacked ward composition: occupied, available, cleaning, reserved. */
export function WardOccupancyChart({ data }: { data: WardStat[] }) {
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1">
        {SERIES.map((entry) => (
          <span
            key={entry.key}
            className="flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: entry.color }}
              aria-hidden="true"
            />
            {entry.name}
          </span>
        ))}
      </div>
      <div
        className="h-60"
        role="img"
        aria-label="Bed composition per ward. Every ward shows occupied, available, cleaning and reserved beds."
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
              dataKey="ward"
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              axisLine={false}
              tickLine={false}
              interval={0}
              angle={-12}
              dy={10}
            />
            <YAxis
              tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
              content={<WardTooltip />}
            />
            {SERIES.map((entry, index) => (
              <Bar
                key={entry.key}
                dataKey={entry.key}
                name={entry.name}
                stackId="ward"
                fill={entry.color}
                radius={index === SERIES.length - 1 ? [3, 3, 0, 0] : undefined}
                maxBarSize={34}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}