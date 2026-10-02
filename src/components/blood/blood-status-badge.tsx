import type {
  BloodRequestStatus,
  ContactStatus,
  DonorStatus,
  RequestUrgency,
  SosBroadcastStatus,
  SosResponseStatus,
  StockStatus,
} from '@/types/blood'
import {
  CONTACT_STATUS_LABELS,
  DONOR_STATUS_LABELS,
  REQUEST_STATUS_LABELS,
  REQUEST_URGENCY_LABELS,
  SOS_BROADCAST_LABELS,
  SOS_RESPONSE_LABELS,
  STOCK_STATUS_LABELS,
} from '@/types/blood'
import { StatusBadge, type StatusTone } from '@/components/common/status-badge'

const stockTone: Record<StockStatus, StatusTone> = {
  safe: 'success',
  low: 'warning',
  critical: 'critical',
}

const donorStatusTone: Record<DonorStatus, StatusTone> = {
  eligible: 'success',
  donated_recently: 'warning',
  deferred: 'neutral',
  ineligible: 'critical',
}

const contactTone: Record<ContactStatus, StatusTone> = {
  confirmed: 'success',
  pending: 'warning',
  unavailable: 'neutral',
}

const requestStatusTone: Record<BloodRequestStatus, StatusTone> = {
  pending: 'warning',
  processing: 'info',
  fulfilled: 'success',
  cancelled: 'neutral',
}

const requestUrgencyTone: Record<RequestUrgency, StatusTone> = {
  critical: 'critical',
  urgent: 'warning',
  routine: 'neutral',
}

const sosResponseTone: Record<SosResponseStatus, StatusTone> = {
  awaiting: 'warning',
  broadcasting: 'info',
  received: 'success',
  fulfilled: 'success',
}

const sosBroadcastTone: Record<SosBroadcastStatus, StatusTone> = {
  not_started: 'neutral',
  broadcasting: 'warning',
  completed: 'success',
}

export function StockStatusBadge({
  status,
  className,
}: {
  status: StockStatus
  className?: string
}) {
  return (
    <StatusBadge tone={stockTone[status]} label={STOCK_STATUS_LABELS[status]} className={className} />
  )
}

export function DonorStatusBadge({
  status,
  className,
}: {
  status: DonorStatus
  className?: string
}) {
  return (
    <StatusBadge tone={donorStatusTone[status]} label={DONOR_STATUS_LABELS[status]} className={className} />
  )
}

export function ContactStatusBadge({
  status,
  className,
}: {
  status: ContactStatus
  className?: string
}) {
  return (
    <StatusBadge tone={contactTone[status]} label={CONTACT_STATUS_LABELS[status]} className={className} />
  )
}

export function RequestStatusBadge({
  status,
  className,
}: {
  status: BloodRequestStatus
  className?: string
}) {
  return (
    <StatusBadge tone={requestStatusTone[status]} label={REQUEST_STATUS_LABELS[status]} className={className} />
  )
}

export function RequestUrgencyBadge({
  urgency,
  className,
}: {
  urgency: RequestUrgency
  className?: string
}) {
  return (
    <StatusBadge tone={requestUrgencyTone[urgency]} label={REQUEST_URGENCY_LABELS[urgency]} className={className} />
  )
}

export function SosResponseBadge({
  status,
  className,
}: {
  status: SosResponseStatus
  className?: string
}) {
  return (
    <StatusBadge tone={sosResponseTone[status]} label={SOS_RESPONSE_LABELS[status]} className={className} />
  )
}

export function SosBroadcastBadge({
  status,
  className,
}: {
  status: SosBroadcastStatus
  className?: string
}) {
  return (
    <StatusBadge tone={sosBroadcastTone[status]} label={SOS_BROADCAST_LABELS[status]} className={className} />
  )
}