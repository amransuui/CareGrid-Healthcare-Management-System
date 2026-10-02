/**
 * Phase 6 integrity checks. Bundled to a temp ESM file by the integrity
 * vite config, executed in Node, then the temp artifacts are deleted.
 * Exercises the clinical data generators, services and navigation matching.
 */
import { patientsSeed } from '../src/data/mock/patients'
import { WARDS, computeWardStats } from '../src/data/mock/wards'
import { buildCareTimeline } from '../src/data/mock/clinical-events'
import { vitalsLevel, computeAge } from '../src/lib/clinical'
import { findAppNavItem, isAppNavItemActive } from '../src/config/app-navigation'
import { mockWardService } from '../src/services/mock/mock-ward-service'
import { mockVitalsService } from '../src/services/mock/mock-vitals-service'
import { mockPatientService } from '../src/services/mock/mock-patient-service'
import type { NewPatientInput } from '../src/types/clinical'

let failures = 0
let checks = 0

function assert(condition: unknown, label: string): void {
  checks += 1
  if (!condition) {
    failures += 1
    console.error(`  FAIL: ${label}`)
  } else {
    console.log(`  ok: ${label}`)
  }
}

const PATIENT_COUNT = 25
const ACTIVE_COUNT = PATIENT_COUNT - 2

async function main(): Promise<void> {
  console.log('Clinical data generators')

  assert(patientsSeed.length === PATIENT_COUNT, `patientsSeed has ${PATIENT_COUNT} entries`)
  const active = patientsSeed.filter((p) => p.status !== 'discharged')
  assert(active.length === ACTIVE_COUNT, `${ACTIVE_COUNT} patients are active`)

  const invalidAge = patientsSeed.filter((p) => p.age !== computeAge(p.dateOfBirth))
  assert(invalidAge.length === 0, 'computed ages match dateOfBirth')

  const bedNumbers = active.map((p) => p.bed)
  const uniqueBeds = new Set(bedNumbers)
  assert(bedNumbers.length === uniqueBeds.size, 'no duplicate occupied beds')

  const validWards = new Set(WARDS.map((w) => w.name))
  const wardMismatch = active.filter((p) => !validWards.has(p.ward))
  assert(wardMismatch.length === 0, 'all active patients are in known wards')

  const prefixes = new Set(WARDS.map((w) => w.prefix))
  const bedFormatOk = bedNumbers.every(
    (bed) => bed && (prefixes.has(bed.split('-')[0]) || bed === ''),
  )
  assert(bedFormatOk, 'bed numbers use ward prefixes')

  const validBlood = new Set(['O+', 'O−', 'A+', 'A−', 'B+', 'B−', 'AB+', 'AB−'])
  assert(
    patientsSeed.every((p) => validBlood.has(p.bloodGroup)),
    'blood groups are from the catalog',
  )

  console.log('Vitals generation')

  const readings = await mockVitalsService.latestReadings()
  assert(readings.length === ACTIVE_COUNT, `latest readings cover ${ACTIVE_COUNT} active patients`)
  const patientIds = new Set(active.map((p) => p.patientId))
  assert(
    readings.every((r) => patientIds.has(r.patientId)),
    'readings belong to active patients only',
  )

  const criticalPatient = patientsSeed.find((p) => p.status === 'critical')!
  const criticalReading = readings.find((r) => r.patientId === criticalPatient.patientId)!
  assert(
    vitalsLevel(criticalReading).level === 'critical',
    `critical patient flags as critical (${criticalReading.spo2}% SpO2)`,
  )

  const normalPatient = patientsSeed.find((p) => p.status === 'stable')!
  const normalReading = readings.find((r) => r.patientId === normalPatient.patientId)!
  assert(
    ['steady', 'watch'].includes(vitalsLevel(normalReading).level),
    'stable patient flags steady or watch, never critical',
  )

  const rangeOk = readings.every(
    (r) =>
      r.heartRate >= 40 &&
      r.heartRate <= 130 &&
      r.systolic >= 70 &&
      r.systolic <= 180 &&
      r.diastolic >= 40 &&
      r.diastolic <= 110 &&
      r.temperature >= 35 &&
      r.temperature <= 40.5 &&
      r.spo2 >= 85 &&
      r.spo2 <= 100 &&
      r.respiratoryRate >= 10 &&
      r.respiratoryRate <= 30,
  )
  assert(rangeOk, 'all readings fall in plausible clinical ranges')

  const history = await mockVitalsService.historyFor(criticalPatient.patientId)
  assert(history.length >= 56, `history has ${history.length} sampled points`)
  const timesOk = history.every((point, i) => i === 0 || point.t > history[i - 1].t)
  assert(timesOk, 'history timestamps are monotonic increasing')
  const last = history[history.length - 1]
  assert(
    last.heartRate === criticalReading.heartRate &&
      last.spo2 === criticalReading.spo2,
    'history ends at the latest recorded reading',
  )

  console.log('Ward & bed data')

  const beds = await mockWardService.listBeds()
  const totalBeds = WARDS.reduce((acc, w) => acc + w.bedCount, 0)
  assert(beds.length === totalBeds, `${totalBeds} beds exist (matches ward catalog)`)

  const occupancyOk = active.every((p) => {
    const bed = beds.find((b) => b.number === p.bed)
    return bed && bed.status === 'occupied' && bed.patientId === p.patientId
  })
  assert(occupancyOk, 'every active patient maps to an occupied bed')

  const summary = await mockWardService.summary()
  assert(summary.overall.total === totalBeds, 'overall bed total matches')
  assert(summary.overall.occupied === ACTIVE_COUNT, `occupancy reflects ${ACTIVE_COUNT} patients`)
  assert(
    summary.byWard.every(({ ward, stats }) => stats.total === ward.bedCount),
    'per-ward totals match catalog',
  )
  const ward = await mockWardService.getBed(beds[0].id)
  assert(ward !== null, 'getBed resolves a real bed')

  const pending = await mockWardService.pendingAdmissions()
  assert(pending.length === 3, 'three pending admissions exist')

  console.log('Care timeline')

  const timeline = buildCareTimeline(criticalPatient)
  assert(timeline.length >= 5, `critical patient timeline has ${timeline.length} events`)
  const chronological = timeline.every(
    (e, i) => i === 0 || new Date(e.timestamp) > new Date(timeline[i - 1].timestamp),
  )
  assert(chronological, 'timeline is chronological')
  assert(
    timeline.some((e) => e.event.toLowerCase().includes('rapid response')),
    'critical patient includes an escalation event',
  )
  const dischargeTimeline = buildCareTimeline(
    patientsSeed.find((p) => p.status === 'discharged')!,
  )
  assert(
    dischargeTimeline.some((e) => e.event.toLowerCase().includes('discharged')),
    'discharged patient timeline includes discharge event',
  )

  console.log('Navigation matching')

  assert(
    findAppNavItem('/app/patients')?.item.href === '/app/patients',
    'findAppNavItem matches exact patient route',
  )
  assert(
    findAppNavItem('/app/patients/P-2026-1042')?.item.label === 'Patients',
    'findAppNavItem matches patient detail route',
  )
  assert(
    findAppNavItem('/app/vitals/P-2026-1042')?.item.label === 'Vitals',
    'findAppNavItem matches vitals detail route',
  )
  assert(
    isAppNavItemActive(
      { label: 'Patients', href: '/app/patients', icon: null as never },
      '/app/patients/P-2026-1042',
    ),
    'isAppNavItemActive highlights Patients on detail routes',
  )

  console.log('Service mutations (in-memory)')

  const before = (await mockPatientService.list()).length
  const input: NewPatientInput = {
    fullName: 'Test Admission Tester',
    dateOfBirth: '1989-05-20',
    gender: 'other',
    bloodGroup: 'AB+',
    phone: '+8801712000000',
    emergencyContact: 'Tester (Friend) · +8801712000001',
    department: 'Cardiology',
    ward: 'Cardiology',
    bed: 'CAR-107',
    attendingDoctor: 'Dr. Nazma Sultana',
    assignedNurse: 'Shathi Rani',
    admissionType: 'elective',
    diagnosis: 'Integrity test admission only',
    allergies: ['No known allergies'],
  }
  const created = await mockPatientService.create(input)
  const after = (await mockPatientService.list()).length
  assert(after === before + 1, `create() adds a patient (${before} → ${after})`)
  assert(created.age === 37, 'create() computes age from dateOfBirth')
  const car107 = (await mockWardService.listBeds()).find((b) => b.number === 'CAR-107')!
  assert(car107.status === 'occupied' && car107.patientId === created.patientId, 'create() occupies the chosen bed')

  await mockPatientService.update({
    patientId: created.patientId,
    ward: 'General Ward',
    bed: 'GEN-103',
  })
  const released = (await mockWardService.listBeds()).find((b) => b.number === 'CAR-107')!
  const movedTo = (await mockWardService.listBeds()).find((b) => b.number === 'GEN-103')!
  assert(released.status === 'available', 'move release() frees the old bed')
  assert(movedTo.status === 'occupied' && movedTo.patientId === created.patientId, 'move occupies the new bed')

  const reading = await mockVitalsService.record({
    patientId: created.patientId,
    heartRate: 96,
    systolic: 118,
    diastolic: 74,
    temperature: 36.8,
    spo2: 97,
    respiratoryRate: 16,
    notes: 'Integrity recording',
    recordedBy: 'Integrity Bot',
  })
  const latestNow = await mockVitalsService.getReading(created.patientId)
  assert(latestNow?.id === reading.id, 'record() upserts the latest reading')
  assert(vitalsLevel(latestNow!).level === 'steady', 'new reading flags steady')

  const freeBed = beds.find((b) => b.status === 'available')!
  const bedUpdate = await mockWardService.updateBedStatus(freeBed.id, 'reserved')
  assert(bedUpdate.status === 'reserved', 'updateBedStatus transitions a bed directly')
  const stats = computeWardStats(await mockWardService.listBeds())
  assert(
    stats.total === totalBeds && stats.occupied === ACTIVE_COUNT + 1,
    `ward stats recompute after mutation (occupied=${stats.occupied})`,
  )

  console.log(`\n${checks} checks, ${failures} failures`)
  if (failures > 0) process.exitCode = 1
}

void main()