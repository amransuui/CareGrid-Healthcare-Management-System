import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { cn } from 'cn'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatBdtCompact } from '@/lib/format'
import type { Invoice } from '@/types/billing'
import {
  INVOICE_CATEGORIES,
  INVOICE_CATEGORY_LABELS,
  type InvoiceCategory,
} from '@/types/billing'
import { categoryTotal, invoiceGross, invoiceOutstanding } from '@/lib/billing'

const CATEGORY_COLORS: Record<InvoiceCategory, string> = {
  room: 'var(--chart-1)',
  medication: 'var(--chart-2)',
  procedure: 'var(--chart-3)',
  laboratory: 'var(--chart-4)',
  consumable: 'var(--chart-5)',
  service: 'var(--chart-6)',
}

interface BillingMixChartProps {
  invoices: Invoice[]
  className?: string
}

/** Where the demo money goes: billed total by charge category. */
export function BillingMixChart({ invoices, className }: BillingMixChartProps) {  const data = useMemo(
    () =>
      INVOICE_CATEGORIES.map((category) => ({
        key: category,
        name: INVOICE_CATEGORY_LABELS[category],
        total: invoices
          .filter((invoice) => invoice.status !== 'cancelled')
          .reduce((sum, invoice) => sum + categoryTotal(invoice, category), 0),
      })).filter((entry) => entry.total > 0),
    [invoices],
  )

  if (data.length === 0) return null

  return (
    <Card className={cn('shadow-card', className)}>
      <CardHeader>
        <CardTitle className="text-base">Billed by charge category</CardTitle>
        <p className="text-sm text-muted-foreground">
          Room, procedure, pharmacy, laboratory, consumable and service lines across live demo
          invoices.
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full" role="img" aria-label="Bar chart of billed totals by charge category">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={56}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={56}
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                tickFormatter={(value) => formatBdtCompact(Number(value))}
              />
              <Tooltip
                cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
                formatter={(value) => formatBdtCompact(Number(value))}
                contentStyle={{
                  borderRadius: '0.5rem',
                  border: '1px solid var(--border)',
                  fontSize: '0.75rem',
                }}
              />
              <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={56}>
                {data.map((entry) => (
                  <Cell key={entry.key} fill={CATEGORY_COLORS[entry.key as InvoiceCategory]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

interface OutstandingSplitChartProps {
  invoices: Invoice[]
  className?: string
}

/** Collection risk: fully settled, partly paid, and untouched balances. */
export function OutstandingSplitChart({ invoices, className }: OutstandingSplitChartProps) {
  const data = useMemo(() => {
    let settled = 0
    let partial = 0
    let open = 0
    for (const invoice of invoices) {
      if (invoice.status === 'cancelled' || invoice.status === 'draft') continue
      const outstanding = invoiceOutstanding(invoice)
      if (outstanding === 0) settled += invoiceGross(invoice)
      else if (invoice.paidAmount > 0) partial += outstanding
      else open += outstanding
    }
    return [
      { name: 'Settled', value: settled, color: 'var(--chart-2)' },
      { name: 'Part paid', value: partial, color: 'var(--chart-4)' },
      { name: 'Awaiting payment', value: open, color: 'var(--chart-1)' },
    ].filter((entry) => entry.value > 0)
  }, [invoices])

  const total = data.reduce((sum, entry) => sum + entry.value, 0)

  if (!data.length || total === 0) return null

  return (
    <Card className={cn('shadow-card', className)}>
      <CardHeader>
        <CardTitle className="text-base">Collection position</CardTitle>
        <p className="text-sm text-muted-foreground">
          Issued demo invoices grouped by how much of the balance is still outstanding.
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <div
            className="h-40 w-40 shrink-0"
            role="img"
            aria-label={`Donut chart of collection position totalling ${formatBdtCompact(total)}`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={44}
                  outerRadius={68}
                  paddingAngle={2}
                  stroke="var(--card)"
                >
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatBdtCompact(Number(value))}
                  contentStyle={{
                    borderRadius: '0.5rem',
                    border: '1px solid var(--border)',
                    fontSize: '0.75rem',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="w-full space-y-2">
            {data.map((entry) => (
              <li key={entry.name} className="flex items-center gap-2 text-sm">
                <span
                  className="size-2.5 shrink-0 rounded-sm"
                  style={{ background: entry.color }}
                  aria-hidden="true"
                />
                <span className="text-muted-foreground">{entry.name}</span>
                <span className="ml-auto font-medium tabular-nums">
                  {formatBdtCompact(entry.value)}
                </span>
                <span className="w-10 text-right text-xs text-muted-foreground tabular-nums">
                  {Math.round((entry.value / total) * 100)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
