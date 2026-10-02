import type { StatusTone } from '@/components/common/status-badge'
import { StatusBadge } from '@/components/common/status-badge'
import type { PrescriptionTask } from '@/types/dashboard'
import { cn } from 'cn'

const priorityMeta: Record<
  PrescriptionTask['priority'],
  { tone: StatusTone; label: string }
> = {
  priority: { tone: 'critical', label: 'Priority' },
  standard: { tone: 'neutral', label: 'Standard' },
}

const statusMeta: Record<
  PrescriptionTask['status'],
  { tone: StatusTone; label: string }
> = {
  awaiting_pharmacist: { tone: 'neutral', label: 'Awaiting pharmacist' },
  safety_review: { tone: 'warning', label: 'Safety review' },
  ready: { tone: 'success', label: 'Ready' },
}

/** Pharmacy queue snapshot: priority order, pending items first. */
export function PrescriptionQueuePanel({
  tasks,
}: {
  tasks: PrescriptionTask[]
}) {
  return (
    <ul className="divide-y divide-border">
      {tasks.map((task) => (
        <li
          key={task.id}
          className="flex items-center gap-3 px-4 py-2.5"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium">
              {task.id} · {task.patient}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {task.medication}
            </p>
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <span className="text-xs text-muted-foreground tabular-nums">
              {task.time}
            </span>
            <StatusBadge
              tone={priorityMeta[task.priority].tone}
              label={priorityMeta[task.priority].label}
              className={cn('hidden sm:inline-flex')}
              withDot={false}
            />
            <StatusBadge
              tone={statusMeta[task.status].tone}
              label={statusMeta[task.status].label}
              className="w-fit"
            />
          </div>
        </li>
      ))}
    </ul>
  )
}