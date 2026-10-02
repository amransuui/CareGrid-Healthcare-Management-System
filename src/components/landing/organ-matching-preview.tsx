import { Timer } from 'lucide-react'
import { LandingSection } from '@/components/landing/section'
import { PreviewFrame } from '@/components/landing/preview-frame'
import { PreviewKpi } from '@/components/landing/preview-kpi'
import { PreviewPanel } from '@/components/landing/preview-panel'
import { SectionHeader } from '@/components/common/section-header'
import { StatusBadge } from '@/components/common/status-badge'
import { cn } from 'cn'
import {
  ischemiaTimer,
  moduleCapabilities,
  organMatchPreview,
  waitingListSummary,
} from '@/data/mock/landing-previews'

export function OrganMatchingPreview() {
  return (
    <LandingSection id="organ">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
        <div>
          <SectionHeader
            kicker="Organ care"
            title="Transplant coordination in one place"
            description="Compatibility scoring, a transparent waiting list and viability timers keep the transplant team aligned — from match to recipient."
          />
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {moduleCapabilities.organ.map((capability) => (
              <li
                key={capability}
                className="rounded-lg border bg-card px-4 py-3 text-sm shadow-card"
              >
                {capability}
              </li>
            ))}
          </ul>
        </div>

        <PreviewFrame label="CareGrid.io · Organ matching">
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              {waitingListSummary.map((item) => (
                <PreviewKpi
                  key={item.label}
                  label={item.label}
                  value={item.value}
                />
              ))}
            </div>

            <PreviewPanel
              title="Live match queue"
              action={
                <span className="text-xs text-muted-foreground">
                  12 matches this week
                </span>
              }
            >
              <div className="space-y-3">
                {organMatchPreview.map((match) => (
                  <div
                    key={match.recipient}
                    className="rounded-lg border bg-background p-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">
                          {match.recipient}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {match.organ} · {match.blood} group ·{' '}
                          {match.distance}
                        </p>
                      </div>
                      <StatusBadge tone={match.tone} label={match.compatibility} />
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        Score
                      </span>
                      <div className="h-1.5 flex-1 rounded-full bg-muted">
                        <div
                          className={cn(
                            'h-1.5 rounded-full',
                            match.tone === 'success'
                              ? 'bg-emerald-500'
                              : 'bg-amber-500',
                          )}
                          style={{ width: `${match.score}%` }}
                        />
                      </div>
                      <span className="text-xs tabular-nums font-medium">
                        {match.score}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </PreviewPanel>

            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Timer className="size-3.5" aria-hidden="true" />
                  {ischemiaTimer.label}
                </p>
                <StatusBadge tone="warning" label="In transit" />
              </div>
              <p className="mt-2 text-2xl font-semibold tabular-nums">
                {ischemiaTimer.value}
              </p>
              <div className="mt-3 flex items-center gap-3">
                <div className="h-1.5 flex-1 rounded-full bg-muted">
                  <div
                    className="h-1.5 rounded-full bg-amber-500"
                    style={{ width: '66%' }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {ischemiaTimer.remaining}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {ischemiaTimer.limit}
              </p>
            </div>
          </div>
        </PreviewFrame>
      </div>
    </LandingSection>
  )
}