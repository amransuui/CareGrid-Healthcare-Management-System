import { Activity, ArrowRight, BedDouble } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
} from 'recharts'
import { LandingSection } from '@/components/landing/section'
import { PreviewFrame } from '@/components/landing/preview-frame'
import { PreviewKpi } from '@/components/landing/preview-kpi'
import { StatusBadge } from '@/components/common/status-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  flowTrend,
  heroKpis,
  recentActivity,
  wardOccupancy,
} from '@/data/mock/landing-previews'
import { siteConfig } from '@/config/site'

const occupancyData = wardOccupancy.map((ward) => ({
  name: ward.ward,
  value: Math.round((ward.occupied / ward.total) * 100),
}))

export function HeroSection() {
  return (
    <LandingSection id="home" className="pt-12 pb-4 sm:pt-16">
      <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12">
        <div className="space-y-6">
          <Badge variant="secondary" className="gap-1.5">
            <span
              className="size-2 rounded-full bg-primary"
              aria-hidden="true"
            />
            Clinical operations platform
          </Badge>

          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              {siteConfig.tagline}{' '}
              <span className="text-primary">Connected Care.</span>
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              CareGrid.io unifies hospital care, blood coordination, organ
              matching, prescriptions, pharmacy, patient visibility and
              billing — so every critical workflow shares one operational
              view.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link to="/register">
                Create Account
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/#modules">Explore Platform</Link>
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            Built for hospitals, blood banks and transplant programs.
          </p>
        </div>

        <PreviewFrame
          label="CareGrid.io · Operations overview"
          className="lg:ml-2"
        >
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {heroKpis.map((kpi) => (
                <PreviewKpi
                  key={kpi.label}
                  label={kpi.label}
                  value={kpi.value}
                  trend={kpi.trend}
                />
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Activity className="size-3.5" aria-hidden="true" />
                  Patient flow · 7 days
                </p>
                <div className="mt-2 h-14">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={[...flowTrend]}
                      margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
                    >
                      <Area
                        type="monotone"
                        dataKey="admitted"
                        stroke="var(--chart-1)"
                        strokeWidth={2}
                        fill="var(--chart-1)"
                        fillOpacity={0.14}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <BedDouble className="size-3.5" aria-hidden="true" />
                  Ward occupancy
                </p>
                <div className="mt-2 h-14">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={occupancyData}
                      margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
                    >
                      <Bar
                        dataKey="value"
                        radius={[3, 3, 0, 0]}
                        fill="var(--chart-2)"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-muted/30 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Recent activity
                </p>
                <StatusBadge tone="info" label="Live demo" />
              </div>
              <ul className="mt-2 space-y-1.5">
                {recentActivity.slice(0, 2).map((item, index) => (
                  <li
                    key={index}
                    className="flex justify-between gap-3 text-xs"
                  >
                    <span className="truncate text-foreground">
                      <span className="font-medium">{item.user}</span>{' '}
                      {item.action}
                    </span>
                    <span className="shrink-0 text-muted-foreground">
                      {item.time}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </PreviewFrame>
      </div>
    </LandingSection>
  )
}