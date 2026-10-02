import { Package, TriangleAlert } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { MedicineStockBadge } from '@/components/pharmacy/pharmacy-status-badges'
import { daysUntilExpiry, formatExpiry, formatQuantity, medicineStockStatus } from '@/lib/pharmacy'
import { PHARMACY_CATEGORIES } from '@/data/mock/pharmacy'
import type { PharmacyMedicine } from '@/types/pharmacy'

interface MedicineDrawerProps {
  medicine: PharmacyMedicine | null
  onOpenChange: (open: boolean) => void
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-right">{value}</dd>
    </div>
  )
}

/** Medicine detail drawer with stock and expiry guidance. */
export function MedicineDrawer({ medicine, onOpenChange }: MedicineDrawerProps) {
  if (!medicine) return null
  const status = medicineStockStatus(medicine)
  const days = daysUntilExpiry(medicine.expiryDate)
  const category =
    PHARMACY_CATEGORIES.find((item) => item === medicine.category) ?? medicine.category

  return (
    <Sheet open={Boolean(medicine)} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-md">
        <SheetHeader className="border-b px-6 py-5">
          <div className="flex flex-wrap items-center gap-2 pr-8">
            <SheetTitle className="text-lg">{medicine.name}</SheetTitle>
            <MedicineStockBadge status={status} />
          </div>
          <SheetDescription>
            {medicine.genericName} {medicine.strength}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-6 px-6 py-5">
          <dl className="grid gap-3">
            <DetailRow label="Medicine ID" value={medicine.medicineId} />
            <DetailRow label="Category" value={category} />
            <DetailRow label="Strength" value={medicine.strength} />
            <DetailRow label="Stock on hand" value={medicine.stock.toString()} />
            <DetailRow label="Reorder level" value={medicine.reorderLevel.toString()} />
            <DetailRow label="Shortfall" value={formatQuantity(Math.max(0, medicine.reorderLevel - medicine.stock))} />
            <DetailRow label="Expiry date" value={formatExpiry(medicine.expiryDate)} />
            <DetailRow
              label="Days until expiry"
              value={days < 0 ? 'Expired' : `${days} day${days === 1 ? '' : 's'}`}
            />
          </dl>

          {status !== 'in_stock' ? (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
              <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              <p>
                {status === 'out_of_stock'
                  ? 'This item is out of stock. Raise a reorder with the distributor before demand rises.'
                  : status === 'low_stock'
                    ? 'Stock is at or below the reorder level. Plan a purchase order soon.'
                    : 'This batch expires within 30 days. Use or rotate stock before the expiry window.'}
              </p>
            </div>
          ) : null}

          <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground">
            <Package aria-hidden="true" className="size-4 shrink-0" />
            <span>Demo inventory module — restock and reorder actions are simulated.</span>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t px-6 py-4 text-xs text-muted-foreground">
          <Package aria-hidden="true" className="size-4 shrink-0" />
          <span>Reordering is handled by the pharmacy operations team.</span>
        </div>
      </SheetContent>
    </Sheet>
  )
}