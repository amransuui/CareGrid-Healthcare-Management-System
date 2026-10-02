import { Check, MapPin, Radio, Siren, UserSearch, Users } from 'lucide-react'
import { cn } from 'cn'
import { Button } from '@/components/ui/button'
import {
  SosBroadcastBadge,
  SosResponseBadge,
} from '@/components/blood/blood-status-badge'
import { BLOOD_COMPONENT_LABELS, type SosCase } from '@/types/blood'
import { timeAgo } from '@/lib/time'

const WORKFLOW_STEPS = [
  { key: 'detect', label: 'Detect', icon: UserSearch },
  { key: 'filter', label: 'Filter', icon: Users },
  { key: 'locate', label: 'Locate', icon: MapPin },
  { key: 'broadcast', label: 'Broadcast', icon: Radio },
] as const

function stepState(case_: SosCase, step: (typeof WORKFLOW_STEPS)[number]['key']) {
  switch (step) {
    case 'detect':
      return { done: true, active: false }
    case 'filter':
      return { done: true, active: false }
    case 'locate':
      return { done: case_.broadcastStatus !== 'not_started', active: false }
    case 'broadcast':
      return {
        done: case_.broadcastStatus === 'completed',
        active: case_.broadcastStatus === 'broadcasting',
      }
  }
}

interface SosBoardProps {
  cases: SosCase[]
  canAct: boolean
  busy: boolean
  onAction: (sosId: string, action: 'start_broadcast' | 'mark_donor' | 'mark_response' | 'fulfill') => void
}

/** Emergency SOS command center workflow cards. */
export function SosBoard({ cases, canAct, busy, onAction }: SosBoardProps) {
  const ratio = (sos: SosCase) =>
    sos.unitsRequired > 0 ? Math.round((sos.unitsSecured / sos.unitsRequired) * 100) : 0

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {cases.map((sos) => {
        const progress = ratio(sos)
        const done = sos.responseStatus === 'fulfilled'
        return (
          <article
            key={sos.sosId}
            className={cn(
              'rounded-xl border bg-card p-4 shadow-card',
              sos.patientPriority === 'critical' && 'ring-1 ring-red-200 dark:ring-red-500/30',
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'flex size-8 items-center justify-center rounded-lg',
                    done
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-red-500/10 text-red-600 dark:text-red-400',
                  )}
                >
                  <Siren aria-hidden="true" className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold">{sos.sosId}</p>
                  <p className="text-xs text-muted-foreground">{timeAgo(sos.requestedAt)}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <SosResponseBadge status={sos.responseStatus} />
                <SosBroadcastBadge status={sos.broadcastStatus} />
              </div>
            </div>

            <div className="mt-3 rounded-lg border bg-muted/30 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium tabular-nums">
                  {sos.bloodGroup}{' '}
                  <span className="font-normal text-muted-foreground">
                    · {BLOOD_COMPONENT_LABELS[sos.component]} · {sos.unitsRequired} units
                  </span>
                </p>
                <span
                  className={cn(
                    'text-xs font-medium',
                    done ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400',
                  )}
                >
                  {sos.unitsSecured}/{sos.unitsRequired} secured
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{sos.ward}</p>
              <p className="text-sm">
                {sos.patientName} · <span className="text-muted-foreground">{sos.patientId}</span>
                <span className="ml-1.5 text-xs font-medium uppercase text-red-600 dark:text-red-400">
                  {sos.patientPriority}
                </span>
              </p>
            </div>

            <div className="mt-3" role="progressbar" aria-label="Units secured progress" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted" role="presentation">
                <div
                  className={cn('h-full rounded-full transition-all', done ? 'bg-emerald-500' : 'bg-red-500')}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <ol
              className="mt-4 grid grid-cols-4 gap-1"
              aria-label={`SOS workflow: ${sos.sosId}`}
            >
              {WORKFLOW_STEPS.map((step) => {
                const state = stepState(sos, step.key)
                const Icon = step.icon
                return (
                  <li
                    key={step.key}
                    className={cn(
                      'flex flex-col items-center justify-center gap-1 rounded-lg border px-1 py-2 text-center',
                      state.done && 'border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10',
                      state.active && 'border-amber-300 bg-amber-50 dark:border-amber-500/40 dark:bg-amber-500/10',
                      !state.done && !state.active && 'border-border bg-muted/20 text-muted-foreground opacity-60',
                    )}
                  >
                    <span
                      className={cn(
                        'flex size-5 items-center justify-center rounded-full',
                        state.done
                          ? 'bg-emerald-500 text-white'
                          : state.active
                            ? 'bg-amber-500 text-white'
                            : 'bg-muted text-muted-foreground',
                      )}
                    >
                      {state.done ? (
                        <Check aria-hidden="true" className="size-3" />
                      ) : (
                        <Icon aria-hidden="true" className="size-3" />
                      )}
                    </span>
                    <span className="text-[11px] font-medium">{step.label}</span>
                  </li>
                )
              })}
            </ol>

            {canAct && !done ? (
              <div className="mt-4 flex flex-wrap justify-end gap-2">
                {sos.broadcastStatus === 'not_started' ? (
                  <Button size="sm" disabled={busy} onClick={() => onAction(sos.sosId, 'start_broadcast')}>
                    <Radio aria-hidden="true" className="size-3.5" />
                    Start broadcast
                  </Button>
                ) : null}
                {sos.broadcastStatus === 'broadcasting' ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() => onAction(sos.sosId, 'mark_donor')}
                  >
                    Mark matching donor
                  </Button>
                ) : null}
                {sos.responseStatus === 'broadcasting' ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() => onAction(sos.sosId, 'mark_response')}
                  >
                    Mark response received
                  </Button>
                ) : null}
                {sos.responseStatus === 'received' && sos.unitsSecured > 0 ? (
                  <Button size="sm" variant="outline" disabled={busy} onClick={() => onAction(sos.sosId, 'fulfill')}>
                    Mark fulfilled
                  </Button>
                ) : null}
              </div>
            ) : null}

            <p className="mt-2 text-xs text-muted-foreground">
              Coordinator: {sos.coordinator} · Demo — no real broadcast is sent.
            </p>
          </article>
        )
      })}
    </div>
  )
}