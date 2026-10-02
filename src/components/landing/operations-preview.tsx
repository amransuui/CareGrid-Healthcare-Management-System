import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { LandingSection } from '@/components/landing/section'
import { PreviewFrame } from '@/components/landing/preview-frame'
import { SectionHeader } from '@/components/common/section-header'
import { flowTrend } from '@/data/mock/landing-previews'

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

export function OperationsPreview() {
  return (
    <LandingSection id="operations" className="bg-muted/30">
      <SectionHeader
        kicker="Operations at a glance"
        title="A real-time view of the whole facility"
        description="Daily patient flow across the center — admissions and discharges together, so capacity decisions have the right data behind them."
      />
      <PreviewFrame
        label="CareGrid.io · Patient flow · 7 days"
        className="mt-10"
      >
        <div className="flex flex-wrap items-center gap-4 px-1 pb-2">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="size-2 rounded-full bg-emerald-500" aria-hidden="true" />
            Admitted
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="size-2 rounded-full bg-sky-500" aria-hidden="true" />
            Discharged
          </span>
        </div>
        <div className="h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[...flowTrend]}
              margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
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
                maxBarSize={28}
              />
              <Bar
                dataKey="discharged"
                name="Discharged"
                fill="var(--chart-2)"
                radius={[3, 3, 0, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </PreviewFrame>
    </LandingSection>
  )
}