import { useId } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { VitalsMetric, VitalsPoint } from '@/types/clinical'
import { VITALS_METRIC_LABELS } from '@/lib/clinical-options'

interface VitalsChartProps {
  data: VitalsPoint[]
  metric: VitalsMetric
  unit: string
  color: string
  domain?: [number, number]
  /** Typical reference bounds rendered as subtle guide lines. */
  refLines?: number[]
}

/**
 * Single-metric vitals line chart. Renders text labels alongside color so
 * the chart stays readable without color alone; carries an accessible name.
 */
export function VitalsChart({
  data,
  metric,
  unit,
  color,
  domain,
  refLines = [],
}: VitalsChartProps) {
  const chartId = useId()
  const label = `${VITALS_METRIC_LABELS[metric]} (${unit})`

  return (
    <div
      className="h-64 w-full"
      role="img"
      aria-label={`${label} trend over the last seven days`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 8, right: 12, bottom: 0, left: -8 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
          <XAxis
            dataKey="t"
            tickFormatter={(value: number) =>
              new Date(value).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
              })
            }
            tick={{ fontSize: 11 }}
            className="fill-muted-foreground"
            tickLine={false}
            axisLine={false}
            minTickGap={28}
          />
          <YAxis
            domain={domain ?? ['auto', 'auto']}
            tick={{ fontSize: 11 }}
            className="fill-muted-foreground"
            tickLine={false}
            axisLine={false}
            width={42}
          />
          <Tooltip
            labelFormatter={(value) =>
              new Date(
                typeof value === 'number' || typeof value === 'string' ? Number(value) : Date.now(),
              ).toLocaleString('en-GB', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })
            }
            formatter={(value) => [`${String(value ?? '—')} ${unit}`, label]}
            contentStyle={{
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              background: 'var(--popover)',
              fontSize: 12,
            }}
          />
          {refLines.map((value) => (
            <ReferenceLine
              key={`${chartId}-${value}`}
              y={value}
              stroke="currentColor"
              strokeDasharray="4 4"
              className="opacity-30"
              strokeOpacity={0.35}
            />
          ))}
          <Line
            type="monotone"
            dataKey={metric}
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}