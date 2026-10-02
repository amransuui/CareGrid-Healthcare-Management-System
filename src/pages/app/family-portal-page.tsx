import type { ComponentType, ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BellRing,
  CalendarClock,
  CalendarDays,
  HeartPulse,
  MapPin,
  Phone,
  Pill,
  Stethoscope,
  UserRound,
} from 'lucide-react'
import { Container } from '@/components/common/container'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { LoadingState } from '@/components/common/loading-state'
import { PageHeader } from '@/components/common/page-header'
import { StatusBadge } from '@/components/common/status-badge'
import { CareTimeline, PatientStatusBadge } from '@/components/clinical'
import {
  BillingSummary,
  FamilyNotifications,
  LatestVitalsSummary,
  UpcomingCare,
} from '@/components/family'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { Gender, Patient } from '@/types/clinical'
import { roleLabels } from '@/data/mock/demo-users'
import { useSession } from '@/hooks/use-auth'
import { formatDate } from '@/lib/clinical'
import { dischargeToneFor } from '@/lib/family'
import { isPatientFamily } from '@/lib/roles'
import { userInitials } from '@/lib/utils'
import { familyService } from '@/services'

function genderLabel(gender: Gender): string {
  return gender === 'female' ? 'Female' : gender === 'male' ? 'Male' : 'Other'
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-2 py-1 text-sm">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  )
}

function CardSection({
  title,
  icon: Icon,
  children,
  footer,
}: {
  title: string
  icon?: ComponentType<{ className?: string }>
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <section className="rounded-xl border bg-card p-5">
      <h2 className="mb-3 flex items-center gap-1.5 text-sm font-medium">
        {Icon ? <Icon aria-hidden="true" className="size-4 text-muted-foreground" /> : null}
        {title}
      </h2>
      {children}
      {footer ? (
        <>
          <Separator className="my-3" />
          {footer}
        </>
      ) : null}
    </section>
  )
}

/**
 * Family portal: a read-only, family-friendly summary of a linked patient's
 * admission. Simpler than the clinical views and never exposes staff
 * controls. Data flows through the family service.
 */
export function FamilyPortalPage() {
  const session = useSession()
  const user = session?.user

  const {
    data: links,
    isLoading: linksLoading,
    isError: linksError,
  } = useQuery({
    queryKey: ['family', 'patients'],
    queryFn: () => familyService.listLinkedPatients(),
  })

  const primaryPatientId = links?.[0]?.patientId ?? ''

  const {
    data: snapshot,
    isLoading: snapshotLoading,
    isError: snapshotError,
    refetch,
  } = useQuery({
    queryKey: ['family', 'overview', primaryPatientId],
    queryFn: () => familyService.overview(primaryPatientId),
    enabled: Boolean(primaryPatientId),
  })

  const isLoading = linksLoading || (Boolean(primaryPatientId) && snapshotLoading)
  const isError = linksError || (Boolean(primaryPatientId) && snapshotError)

  if (isLoading) {
    return (
      <Container size="fluid" className="mx-auto max-w-6xl space-y-6 py-6">
        <LoadingState rows={8} />
      </Container>
    )
  }

  if (isError) {
    return (
      <Container size="fluid" className="mx-auto max-w-6xl space-y-6 py-6">
        <ErrorState
          title="Family portal unavailable"
          description="The care summary could not be loaded. Please try again."
          onRetry={() => refetch()}
        />
      </Container>
    )
  }

  if (!links?.length || !snapshot) {
    return (
      <Container size="fluid" className="mx-auto max-w-6xl py-6">
        <PageHeader
          title="Family Portal"
          description="A simple, read-only summary of a family member's hospital care."
        />
        <div className="mt-6">
          <EmptyState
            icon={UserRound}
            title="No linked patient"
            description="This family account is not linked to any patient records yet."
          />
        </div>
      </Container>
    )
  }

  const { patient, link, latestVitals, timeline, upcoming, billing, discharge, notifications } =
    snapshot
  const unread = notifications.filter((notification) => !notification.read)

  return (
    <Container size="fluid" className="mx-auto max-w-6xl space-y-6 py-6">
      <PageHeader
        title="Family Portal"
        description={`Welcome${user ? `, ${user.fullName}` : ''}. Here is an easy-to-read summary of ${patient.fullName}'s hospital care.`}
        actions={
          <>
            <PatientStatusBadge status={patient.status} />
            {user ? (
              <StatusBadge tone="info" label={roleLabels[user.role]} />
            ) : null}
          </>
        }
      />

      {!isPatientFamily(user?.role) ? (
        <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-400">
          Preview — you are signed in as staff. This is the simplified family view shown to
          patient/family accounts.
        </div>
      ) : null}

      {unread.length ? (
        <section aria-label="Important notifications" className="rounded-xl border bg-card p-5">
          <h2 className="mb-3 flex items-center gap-1.5 text-sm font-medium">
            <BellRing aria-hidden="true" className="size-4 text-muted-foreground" />
            Important for you
          </h2>
          <FamilyNotifications notifications={unread} />
        </section>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <section className="rounded-xl border bg-card p-5">
            <div className="flex flex-wrap items-center gap-4">
              <span
                className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-xl font-semibold text-primary"
                aria-hidden="true"
              >
                {userInitials(patient.fullName)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-semibold tracking-tight">{patient.fullName}</p>
                <p className="text-sm text-muted-foreground">
                  Linked as {link.relationship.toLowerCase()} · {patient.patientId}
                </p>
              </div>
              <UpcomingStatusSummary status={patient.status} />
            </div>
            <Separator className="my-4" />
            <dl className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
              <InfoRow label="Age / gender" value={`${patient.age} · ${genderLabel(patient.gender)}`} />
              <InfoRow label="Blood group" value={patient.bloodGroup} />
              <InfoRow label="Date of birth" value={formatDate(patient.dateOfBirth)} />
            </dl>
          </section>

          <div className="grid gap-4 sm:grid-cols-2">
            <CardSection title="Admission info" icon={CalendarDays}>
              <dl className="divide-y divide-border">
                <InfoRow label="Admitted" value={formatDate(patient.admissionDate)} />
                <InfoRow label="Department" value={patient.department} />
                <InfoRow label="Ward" value={patient.ward} />
                <InfoRow label="Bed" value={patient.bed || '—'} />
                <InfoRow label="Admission type" value={patient.admissionType.replace('_', ' ')} />
              </dl>
            </CardSection>

            <CardSection title="Care team" icon={Stethoscope}>
              <dl className="divide-y divide-border">
                <InfoRow label="Assigned doctor" value={patient.attendingDoctor} />
                <InfoRow label="Assigned nurse" value={patient.assignedNurse} />
                <InfoRow label="Diagnosis" value={patient.diagnosis} />
              </dl>
            </CardSection>
          </div>

          <CardSection title="Latest vitals" icon={HeartPulse}>
            <LatestVitalsSummary reading={latestVitals} />
          </CardSection>

          <CardSection title="Medications" icon={Pill}>
            {patient.medications.length ? (
              <ul className="divide-y divide-border">
                {patient.medications.map((medication, index) => (
                  <li
                    key={`${medication.name}-${index}`}
                    className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium">{medication.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {medication.dosage} · {medication.frequency} · {medication.route}
                      </p>
                    </div>
                    <StatusBadge
                      tone={medication.status === 'active' ? 'success' : 'neutral'}
                      label={medication.status}
                      className="shrink-0"
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                title="No medications"
                description="No medications are recorded for this admission."
              />
            )}
          </CardSection>
        </div>

        <div className="space-y-4">
          <CardSection title="Billing summary" icon={CalendarDays}>
            <BillingSummary billing={billing} />
          </CardSection>

          <CardSection title="Discharge status" icon={CalendarClock}>
            <StatusBadge tone={dischargeToneFor(discharge.state)} label={discharge.label} />
            <p className="mt-3 text-sm text-muted-foreground">{discharge.description}</p>
            {discharge.estimatedAt ? (
              <p className="mt-3 text-xs text-muted-foreground">
                Estimated discharge around {formatDate(discharge.estimatedAt)}.
              </p>
            ) : null}
          </CardSection>

          <CardSection title="Upcoming care" icon={CalendarClock}>
            <UpcomingCare events={upcoming} />
          </CardSection>

          <CardSection title="Emergency contact" icon={Phone}>
            <div className="flex items-start gap-2 text-sm">
              <Phone aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="font-medium">{patient.emergencyContact}</p>
                {patient.phone ? <p className="mt-1 text-xs text-muted-foreground">{patient.phone}</p> : null}
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              This is who staff will call if anything changes during the admission.
            </p>
          </CardSection>
        </div>
      </div>

      <CardSection title="Care timeline" icon={MapPin}>
        <CareTimeline events={timeline} />
      </CardSection>

      <Card className="shadow-card">
        <div className="flex items-start gap-3 p-5">
          <UserRound aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">About this portal</p>
            <p className="mt-1">
              This is a demo interface built for the CareGrid.io lab project. All patient,
              billing and care information shown is fictional and lives only in the frontend
              mock data — nothing is stored or sent to a real hospital system.
            </p>
          </div>
        </div>
      </Card>
    </Container>
  )
}

function UpcomingStatusSummary({ status }: { status: Patient['status'] }) {
  const label: Record<Patient['status'], string> = {
    stable: 'Condition stable',
    under_observation: 'Under observation',
    critical: 'Intensive care',
    discharged: 'Discharged',
  }
  const tone: Record<Patient['status'], 'success' | 'warning' | 'critical' | 'neutral'> = {
    stable: 'success',
    under_observation: 'warning',
    critical: 'critical',
    discharged: 'neutral',
  }
  return <StatusBadge tone={tone[status]} label={label[status]} />
}