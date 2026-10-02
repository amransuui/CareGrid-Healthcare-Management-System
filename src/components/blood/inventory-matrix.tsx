import { CalendarClock, Droplets, Search, X } from 'lucide-react'
import { cn } from 'cn'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { BLOOD_COMPONENT_LABELS, type BloodComponent, type BloodInventoryItem, type StockStatus } from '@/types/blood'
import { BLOOD_GROUPS } from '@/types/blood'
import { isExpiringSoon, stockStatusForUnits, daysUntilExpiry } from '@/lib/blood'
import {
  EXPIRY_FILTER_OPTIONS,
  EMPTY_BLOOD_INVENTORY_FILTERS,
  STOCK_FILTER_OPTIONS,
  type BloodInventoryFilterState,
} from '@/lib/blood-filters'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

const COMPONENT_ORDER: BloodComponent[] = ['whole_blood', 'rbc', 'platelets', 'plasma']

const statusCell: Record<StockStatus, { cell: string; text: string; dot: string }> = {
  safe: { cell: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  low: { cell: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
  critical: { cell: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500' },
}

interface InventoryMatrixProps {
  items: BloodInventoryItem[]
  filters: BloodInventoryFilterState
  onChange: (next: BloodInventoryFilterState) => void
}

/** 8-group × 4-component stock matrix with filterable highlight. */
export function InventoryMatrix({ items, filters, onChange }: InventoryMatrixProps) {
  const q = filters.search.trim().toLowerCase()

  const byGroupComponent = new Map<string, BloodInventoryItem>()
  for (const item of items) byGroupComponent.set(`${item.bloodGroup}::${item.component}`, item)

  const componentLabel = (component: BloodComponent) => BLOOD_COMPONENT_LABELS[component]

  const groups = BLOOD_GROUPS.filter((group) => {
    if (filters.bloodGroup !== 'all' && group !== filters.bloodGroup) return false
    if (q && !group.toLowerCase().includes(q)) return false
    return true
  })

  const components = COMPONENT_ORDER.filter((component) => {
    if (filters.component !== 'all' && component !== filters.component) return false
    if (q && !componentLabel(component).toLowerCase().includes(q)) return false
    return true
  })

  const hasActive =
    q !== '' ||
    filters.bloodGroup !== 'all' ||
    filters.component !== 'all' ||
    filters.status !== 'all' ||
    filters.expiry !== 'all'

  const set = <K extends keyof BloodInventoryFilterState>(key: K, value: BloodInventoryFilterState[K]) =>
    onChange({ ...filters, [key]: value })

  const matches = (item: BloodInventoryItem) => {
    const stock = stockStatusForUnits(item.units)
    const days = daysUntilExpiry(item)
    if (filters.status !== 'all' && stock !== filters.status) return false
    if (filters.expiry === 'within7' && days > 7) return false
    if (filters.expiry === 'within30' && days > 30) return false
    return true
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-3">
        <div className="relative flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <label htmlFor="inventory-search" className="sr-only">
            Search inventory by blood group or component
          </label>
          <Input
            id="inventory-search"
            value={filters.search}
            onChange={(event) => set('search', event.target.value)}
            placeholder="Search by blood group or component…"
            className="pl-9"
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Select value={filters.bloodGroup} onValueChange={(value) => set('bloodGroup', value)}>
            <SelectTrigger aria-label="Filter by blood group">
              <SelectValue placeholder="All blood groups" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All blood groups</SelectItem>
              {BLOOD_GROUPS.map((group) => (
                <SelectItem key={group} value={group}>
                  {group}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.component} onValueChange={(value) => set('component', value as BloodInventoryFilterState['component'])}>
            <SelectTrigger aria-label="Filter by component">
              <SelectValue placeholder="All components" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All components</SelectItem>
              {COMPONENT_ORDER.map((component) => (
                <SelectItem key={component} value={component}>
                  {componentLabel(component)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.status} onValueChange={(value) => set('status', value as BloodInventoryFilterState['status'])}>
            <SelectTrigger aria-label="Filter by stock status">
              <SelectValue placeholder="All stock levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All stock levels</SelectItem>
              {STOCK_FILTER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.expiry} onValueChange={(value) => set('expiry', value as BloodInventoryFilterState['expiry'])}>
            <SelectTrigger aria-label="Filter by expiry window">
              <SelectValue placeholder="Any expiry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any expiry</SelectItem>
              {EXPIRY_FILTER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {hasActive ? (
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange(EMPTY_BLOOD_INVENTORY_FILTERS)}
              aria-label="Clear all inventory filters"
            >
              <X aria-hidden="true" className="size-3.5" />
              Clear
            </Button>
          </div>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        {groups.length === 0 || components.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center" role="status">
            <Droplets aria-hidden="true" className="size-6 text-muted-foreground/60" />
            <p className="text-sm font-medium">No stock matches the filters</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Adjust the search or filters to see inventory entries.
            </p>
          </div>
        ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">
                  <span className="flex items-center gap-1.5">
                    <Droplets aria-hidden="true" className="size-3.5 text-muted-foreground" />
                    Blood group
                  </span>
                </TableHead>
                {components.map((component) => (
                  <TableHead key={component} className="text-center">
                    {componentLabel(component)}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map((group) => (
                <TableRow key={group}>
                  <TableCell className="font-medium tabular-nums">{group}</TableCell>
                  {components.map((component) => {
                    const item = byGroupComponent.get(`${group}::${component}`)
                    if (!item) {
                      return <TableCell key={component} className="text-center text-muted-foreground">—</TableCell>
                    }
                    const stock = stockStatusForUnits(item.units)
                    const expiring = isExpiringSoon(item)
                    const active = matches(item)
                    const styles = statusCell[stock]
                    return (
                      <TableCell key={component} className={cn('p-2 text-center', active && styles.cell)}>
                        <div className="flex flex-col items-center gap-1">
                          <span
                            className={cn(
                              'flex items-center gap-1.5 text-sm font-semibold tabular-nums',
                              active ? styles.text : 'text-muted-foreground',
                              !active && 'opacity-40',
                            )}
                          >
                            <span
                              className={cn('size-1.5 rounded-full', active ? styles.dot : 'bg-muted-foreground/40')}
                              aria-hidden="true"
                            />
                            {item.units}
                            <span className="sr-only">
                              {componentLabel(component)} units for {group}
                              {active ? '' : ', outside current filters'}
                            </span>
                          </span>
                          {expiring ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span
                                  className={cn(
                                    'inline-flex items-center gap-1 text-[11px]',
                                    active ? 'text-amber-700 dark:text-amber-400' : 'text-muted-foreground opacity-50',
                                  )}
                                >
                                  <CalendarClock aria-hidden="true" className="size-3" />
                                  {new Date(item.expiryDate).toLocaleDateString('en-GB', {
                                    day: 'numeric',
                                    month: 'short',
                                  })}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>Expiring soon</TooltipContent>
                            </Tooltip>
                          ) : null}
                        </div>
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        )}
      </div>
    </div>
  )
}