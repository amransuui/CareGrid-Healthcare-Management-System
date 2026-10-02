import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowRight,
  Boxes,
  ClipboardList,
  Pill,
  TriangleAlert,
} from 'lucide-react'
import { Container } from '@/components/common/container'
import { DemoNotice } from '@/components/common/demo-notice'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { KpiCard } from '@/components/common/kpi-card'
import { PageHeader } from '@/components/common/page-header'
import { PageSkeleton } from '@/components/common/page-skeleton'
import { PanelHeader } from '@/components/common/panel-header'
import { StatusBadge } from '@/components/common/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  PharmacyStatusBadge,
  PrescriptionStatusBadge,
} from '@/components/pharmacy/pharmacy-status-badges'
import { pharmacyService } from '@/services'
import { formatDateTime } from '@/lib/clinical'
import { daysUntilExpiry, medicineStockStatus } from '@/lib/pharmacy'
import { timeAgo } from '@/lib/time'
import {
  MEDICINE_STOCK_LABELS,
  SAFETY_ALERT_SEVERITY_LABELS,
  SAFETY_ALERT_TYPE_LABELS,
} from '@/types/pharmacy'

const SEVERITY_TONE = {
  high: 'critical',
  medium: 'warning',
  low: 'info',
} as const

/** Pharmacy landing view: dispensing queue, stock pressure and safety alerts. */
export function PharmacyPage() {
  const prescriptionsQuery = useQuery({
    queryKey: ['pharmacy', 'prescriptions'],
    queryFn: () => pharmacyService.listPrescriptions(),
  })
  const medicinesQuery = useQuery({
    queryKey: ['pharmacy', 'medicines'],
    queryFn: () => pharmacyService.listMedicines(),
  })
  const alertsQuery = useQuery({
    queryKey: ['pharmacy', 'alerts'],
    queryFn: () => pharmacyService.listAlerts(),
  })

  const stats = useMemo(() => {
    const prescriptions = prescriptionsQuery.data ?? []
    const medicines = medicinesQuery.data ?? []
    const alerts = alertsQuery.data ?? []

    const queue = prescriptions.filter(
      (entry) => entry.status !== 'cancelled' && entry.pharmacyStatus !== 'dispensed',
    )
    const openAlerts = alerts.filter(
      (alert) => alert.status === 'new' || alert.status === 'reviewing',
    )
    const highSeverity = openAlerts.filter((alert) => alert.severity === 'high')
    const needsAttention = medicines.filter((medicine) => {
      const status = medicineStockStatus(medicine)
      return status !== 'in_stock'
    })
    const expiring = medicines.filter(
      (medicine) => daysUntilExpiry(medicine.expiryDate) <= 30 && medicine.stock > 0,
    )

    return {
      queue,
      openAlerts,
      highSeverity,
      needsAttention,
      expiring,
      totalMedicines: medicines.length,
      readyForCollection: prescriptions.filter((p) => p.pharmacyStatus === 'ready').length,
      preparing: prescriptions.filter((p) => p.pharmacyStatus === 'preparing').length,
    }
  }, [prescriptionsQuery.data, medicinesQuery.data, alertsQuery.data])

  if (
    prescriptionsQuery.isLoading ||
    medicinesQuery.isLoading ||
    alertsQuery.isLoading
  ) {
    return (
      <Container size="fluid" className="max-w-[90rem] space-y-6 py-6">
        <PageSkeleton kpis={4} />
      </Container>
    )
  }

  if (
    prescriptionsQuery.isError ||
    medicinesQuery.isError ||
    alertsQuery.isError
  ) {
    return (
      <Container size="fluid" className="max-w-[90rem] space-y-6 py-6">
        <ErrorState
          title="Could not load pharmacy data"
          description="The demo pharmacy modules could not be read. Please try again."
          onRetry={() => {
            void prescriptionsQuery.refetch()
            void medicinesQuery.refetch()
            void alertsQuery.refetch()
          }}
        />
      </Container>
    )
  }

  return (
    <Container size="fluid" className="max-w-[90rem] space-y-6 py-6">
      <PageHeader
        title="Pharmacy"
        description="Dispensing queue, medication stock and safety alerts for the demo hospital."
        actions={
          <Button asChild variant="outline">
            <Link to="/app/pharmacy/prescriptions">
              Open dispensing queue
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </Button>
        }
      />

      <DemoNotice
        tone="warning"
        title="Fictional medication data"
        description="Every medicine, strength, batch and interaction warning in this module is invented for demonstration. Nothing here is a dispensing instruction or a substitute for a pharmacist's judgement."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="In the queue"
          value={stats.queue.length}
          context={`${stats.preparing} preparing · ${stats.readyForCollection} ready for collection`}
          icon={ClipboardList}
          tone="info"
        />
        <KpiCard
          label="Open safety alerts"
          value={stats.openAlerts.length}
          context={`${stats.highSeverity.length} high severity awaiting review`}
          icon={TriangleAlert}
          tone={stats.highSeverity.length > 0 ? 'critical' : 'warning'}
        />
        <KpiCard
          label="Stock needs attention"
          value={stats.needsAttention.length}
          context={`Low, out of stock or expiring across ${stats.totalMedicines} medicines`}
          icon={Boxes}
          tone="warning"
        />
        <KpiCard
          label="Expiring within 30 days"
          value={stats.expiring.length}
          context="Fictional batches dated relative to today"
          icon={Pill}
          tone={stats.expiring.length > 0 ? 'warning' : 'neutral'}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardContent className="space-y-4 p-4 sm:p-5">
            <PanelHeader
              title="Dispensing queue"
              description="Prescriptions still being prepared or awaiting collection."
              actions={
                <Button asChild size="sm" variant="ghost">
                  <Link to="/app/pharmacy/prescriptions">View all</Link>
                </Button>
              }
            />
            {stats.queue.length === 0 ? (
              <EmptyState
                title="The queue is clear"
                description="No demo prescription is waiting to be dispensed."
              />
            ) : (
              <ul className="divide-y rounded-lg border">
                {stats.queue.slice(0, 6).map((prescription) => (
                  <li key={prescription.prescriptionId} className="flex flex-wrap items-center gap-3 p-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{prescription.patientName}</p>
                      <p className="text-xs text-muted-foreground">
                        {prescription.prescriptionId} · {prescription.medications.length} medicine
                        {prescription.medications.length === 1 ? '' : 's'} ·{' '}
                        {prescription.doctorName}
                      </p>
                    </div>
                    <PharmacyStatusBadge status={prescription.pharmacyStatus} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="space-y-4 p-4 sm:p-5">
            <PanelHeader
              title="Open safety alerts"
              description="Simulated allergy, interaction and duplicate-medication warnings."
              actions={
                <Button asChild size="sm" variant="ghost">
                  <Link to="/app/pharmacy/alerts">Review all</Link>
                </Button>
              }
            />
            {stats.openAlerts.length === 0 ? (
              <EmptyState
                title="No open alerts"
                description="Every simulated safety alert has been resolved or dismissed."
              />
            ) : (
              <ul className="divide-y rounded-lg border">
                {stats.openAlerts.slice(0, 6).map((alert) => (
                  <li key={alert.alertId} className="flex flex-wrap items-start gap-3 p-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{alert.subject}</p>
                      <p className="text-xs text-muted-foreground">
                        {SAFETY_ALERT_TYPE_LABELS[alert.type]} · {alert.assignedRole} ·{' '}
                        {timeAgo(alert.createdAt)}
                      </p>
                    </div>
                    <StatusBadge
                      tone={SEVERITY_TONE[alert.severity]}
                      label={SAFETY_ALERT_SEVERITY_LABELS[alert.severity]}
                      withDot={false}
                    />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardContent className="space-y-4 p-4 sm:p-5">
          <PanelHeader
            title="Stock pressure"
            description="Medicines at or below their reorder level, or close to expiry."
            actions={
              <Button asChild size="sm" variant="ghost">
                <Link to="/app/pharmacy/inventory">Open inventory</Link>
              </Button>
            }
          />
          {stats.needsAttention.length === 0 ? (
            <EmptyState
              title="Stock looks healthy"
              description="No demo medicine is low, out of stock or expiring soon."
            />
          ) : (
            <ul className="space-y-3">
              {stats.needsAttention.map((medicine) => {
                const status = medicineStockStatus(medicine)
                const max = Math.max(medicine.reorderLevel * 2, medicine.stock, 1)
                return (
                  <li key={medicine.medicineId} className="rounded-lg border p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium">
                        {medicine.name} {medicine.strength}
                      </p>
                      <StatusBadge
                        tone={status === 'out_of_stock' ? 'critical' : 'warning'}
                        label={MEDICINE_STOCK_LABELS[status]}
                        withDot={false}
                      />
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {medicine.genericName} · {medicine.category} · reorder level{' '}
                      {medicine.reorderLevel} · expires {formatDateTime(medicine.expiryDate)}
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <Progress
                        value={Math.min(100, (medicine.stock / max) * 100)}
                        aria-label={`${medicine.name} stock level`}
                      />
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {medicine.stock} on hand
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardContent className="p-4 sm:p-5">
          <PanelHeader
            title="Recent prescriptions"
            description="Latest fictional prescriptions written in the demo ward."
            actions={
              <Button asChild size="sm" variant="ghost">
                <Link to="/app/pharmacy/prescriptions">View all</Link>
              </Button>
            }
          />
          <ul className="mt-3 divide-y rounded-lg border">
            {(prescriptionsQuery.data ?? []).slice(0, 5).map((prescription) => (
              <li
                key={prescription.prescriptionId}
                className="flex flex-wrap items-center gap-3 p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{prescription.patientName}</p>
                  <p className="text-xs text-muted-foreground">
                    {prescription.prescriptionId} · {prescription.diagnosis} ·{' '}
                    {formatDateTime(prescription.createdAt)}
                  </p>
                </div>
                <PrescriptionStatusBadge status={prescription.status} />
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </Container>
  )
}
