import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CalendarClock, Droplets, PackageCheck, PieChart, TriangleAlert } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Container } from '@/components/common/container'
import { ErrorState } from '@/components/common/error-state'
import { KpiCard } from '@/components/common/kpi-card'
import { PageHeader } from '@/components/common/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { InventoryMatrix } from '@/components/blood'
import { BLOOD_GROUPS } from '@/types/blood'
import { isExpiringSoon, stockStatusForUnits } from '@/lib/blood'
import {
  EMPTY_BLOOD_INVENTORY_FILTERS,
  type BloodInventoryFilterState,
} from '@/lib/blood-filters'
import { bloodService } from '@/services'

/** Blood inventory command center: KPIs, 8×4 matrix, distribution chart. */
export function BloodInventoryPage() {
  const [filters, setFilters] = useState<BloodInventoryFilterState>(
    EMPTY_BLOOD_INVENTORY_FILTERS,
  )

  const { data: items, isLoading, isError, refetch } = useQuery({
    queryKey: ['blood', 'inventory'],
    queryFn: () => bloodService.listInventory(),
  })

  const kpis = useMemo(() => {
    const list = items ?? []
    const totalUnits = list.reduce((sum, item) => sum + item.units, 0)
    const criticalCount = list.filter((item) => stockStatusForUnits(item.units) === 'critical').length
    const availableUnits = list
      .filter((item) => stockStatusForUnits(item.units) === 'safe')
      .reduce((sum, item) => sum + item.units, 0)
    const expiringCount = list.filter((item) => isExpiringSoon(item)).length
    return { totalUnits, criticalCount, availableUnits, expiringCount }
  }, [items])

  const distribution = useMemo(() => {
    return BLOOD_GROUPS.map((group) => ({
      group,
      units: (items ?? [])
        .filter((item) => item.bloodGroup === group)
        .reduce((sum, item) => sum + item.units, 0),
    }))
  }, [items])

  return (
    <Container size="fluid" className="max-w-[90rem] space-y-6 py-6">
      <PageHeader
        title="Blood Inventory"
        description="Component stock levels across all eight blood groups."
      />

      {isLoading ? (
        <div className="space-y-4" aria-hidden="true">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-28 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <KpiCard
              label="Total units"
              value={kpis.totalUnits}
              context="Across all groups and components"
              icon={Droplets}
              tone="info"
            />
            <KpiCard
              label="Critical stock"
              value={kpis.criticalCount}
              context="Entries below safe levels"
              icon={TriangleAlert}
              tone="critical"
            />
            <KpiCard
              label="Available units"
              value={kpis.availableUnits}
              context="Stock at safe level"
              icon={PackageCheck}
              tone="success"
            />
            <KpiCard
              label="Expiring soon"
              value={kpis.expiringCount}
              context="Entries within 7 days"
              icon={CalendarClock}
              tone="warning"
            />
          </div>

          <InventoryMatrix items={items ?? []} filters={filters} onChange={setFilters} />

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart aria-hidden="true" className="size-4 text-primary" />
                Blood group distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="h-64 w-full"
                role="img"
                aria-label="Total inventory units by blood group"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distribution} margin={{ top: 8, right: 12, bottom: 0, left: -16 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                    <XAxis dataKey="group" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip
                      cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                      formatter={(value) => [`${value} units`, 'Stock']}
                    />
                    <Bar dataKey="units" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </Container>
  )
}