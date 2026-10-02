import { ReceiptText } from 'lucide-react'
import { EmptyState } from '@/components/common/empty-state'
import type { FamilyBillingSummary } from '@/types/family'
import { formatCurrency } from '@/lib/family'
import { formatDate } from '@/lib/clinical'

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium tabular-nums">{value}</dd>
    </div>
  )
}

/** Simplified billing snapshot shown to the family. */
export function BillingSummary({ billing }: { billing: FamilyBillingSummary }) {
  return (
    <div className="space-y-4">
      <dl className="divide-y divide-border rounded-lg border px-4 py-1">
        <SummaryRow label="Total charged" value={formatCurrency(billing.totalCharged, billing.currency)} />
        <SummaryRow label="Paid" value={formatCurrency(billing.paidAmount, billing.currency)} />
        <SummaryRow
          label="Outstanding"
          value={formatCurrency(billing.outstandingAmount, billing.currency)}
        />
      </dl>

      {billing.items.length ? (
        <div>
          <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Day statement
          </p>
          <ul className="space-y-1.5">
            {billing.items.map((item, index) => (
              <li
                key={`${item.label}-${index}`}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="min-w-0 text-muted-foreground">{item.label}</span>
                <span className="shrink-0 font-medium tabular-nums">
                  {formatCurrency(item.amount, billing.currency)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <EmptyState
          icon={ReceiptText}
          title="No charges yet"
          description="Charges from this admission will appear once invoiced."
        />
      )}

      <p className="text-xs text-muted-foreground">
        Last updated {formatDate(billing.lastInvoiceAt)}. Demo figures only — not a real
        invoice.
      </p>
    </div>
  )
}