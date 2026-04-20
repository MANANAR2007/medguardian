import ActivityLogList from '../components/ActivityLogList'
import AlertCard from '../components/AlertCard'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import HealthNotesCard from '../components/HealthNotesCard'
import LinkPatientCard from '../components/LinkPatientCard'
import MedicationScheduleList from '../components/MedicationScheduleList'
import SectionHeader from '../components/SectionHeader'
import StatCard from '../components/StatCard'
import WeeklyTrendCard from '../components/WeeklyTrendCard'
import { useMedicationData } from '../hooks/useMedicationData'
import { groupMedicationsByDaypart } from '../utils/schedule'

export default function CaregiverDashboardPage() {
  const {
    accessProfile,
    adherence,
    dataError,
    dataLoading,
    interactionWarnings,
    isDoseDueToday,
    linkedPatientProfile,
    logs,
    medications,
    medicationsById,
    notes,
    todayStatusMap,
    weeklyTrend,
    warningsByMedicationId,
  } = useMedicationData()

  const groupedMedications = groupMedicationsByDaypart(medications)
  const missedLogs = logs.filter((log) => log.status === 'missed').slice(0, 5)
  const recentActivity = logs.slice(0, 8)

  return (
    <div className="space-y-6">
      <Card>
        <SectionHeader
          eyebrow="Caregiver dashboard"
          title={linkedPatientProfile ? `Monitoring ${linkedPatientProfile.email}` : 'Connect to a patient account'}
          description="Review adherence, missed doses, medication warnings, and recent patient activity from a focused caregiver view."
        />
      </Card>

      <LinkPatientCard linkedPatientProfile={linkedPatientProfile} />

      {!linkedPatientProfile ? (
        <EmptyState
          title="No patient linked yet"
          description="Once a caregiver links to a patient, medication data and adherence insights will appear here."
        />
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Adherence"
              value={`${adherence.adherencePercentage}%`}
              loading={dataLoading}
              helper={`Last ${adherence.windowDays} days`}
              tone={adherence.adherencePercentage < 70 ? 'danger' : 'success'}
            />
            <StatCard
              label="Missed doses"
              value={adherence.totalMissed}
              loading={dataLoading}
              helper="Current window"
              tone={adherence.totalMissed > 0 ? 'danger' : 'default'}
            />
            <StatCard
              label="Warnings"
              value={interactionWarnings.length}
              helper={accessProfile?.email ? `Patient: ${accessProfile.email}` : 'Linked patient'}
              tone={interactionWarnings.length > 0 ? 'warning' : 'success'}
            />
            <StatCard
              label="Streak"
              value={`${adherence.streakDays} day${adherence.streakDays === 1 ? '' : 's'}`}
              loading={dataLoading}
              helper="Fully completed days"
              tone={adherence.streakDays > 0 ? 'success' : 'warning'}
            />
          </section>

          <section className="grid gap-4 xl:grid-cols-3">
            {adherence.totalMissed > 0 ? (
              <AlertCard
                title="Missed dose warning"
                tone="danger"
                message="The linked patient has missed one or more logged doses. Review missed-dose activity below."
              />
            ) : null}

            {adherence.adherencePercentage < 70 && medications.length > 0 ? (
              <AlertCard
                title="Low adherence warning"
                tone="warning"
                message="The linked patient's adherence score is below 70%, which may warrant a check-in."
              />
            ) : null}

            {interactionWarnings.length > 0 ? (
              <AlertCard
                title="Medication warning"
                tone="warning"
                message={interactionWarnings.map((warning) => warning.warning).join(' ')}
              />
            ) : null}
          </section>

          {dataError ? <AlertCard title="Data warning" message={dataError} tone="warning" /> : null}

          <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
            <div className="space-y-6">
              {medications.length === 0 && !dataLoading ? (
                <EmptyState
                  title="No patient medications found"
                  description="The linked patient has not added any medications yet."
                />
              ) : (
                <MedicationScheduleList
                  groups={groupedMedications}
                  todayStatusMap={todayStatusMap}
                  warningsByMedicationId={warningsByMedicationId}
                  isDoseDueToday={isDoseDueToday}
                  readOnly
                />
              )}

              <WeeklyTrendCard trend={weeklyTrend} />
            </div>

            <div className="space-y-6">
              <Card>
                <SectionHeader eyebrow="Missed doses" title="Critical activity" compact />
                <div className="mt-4">
                  <ActivityLogList
                    logs={missedLogs}
                    medicationsById={medicationsById}
                    emptyMessage="No missed doses have been logged for the linked patient."
                  />
                </div>
              </Card>

              <Card>
                <SectionHeader eyebrow="Recent activity" title="Latest patient logs" compact />
                <div className="mt-4">
                  <ActivityLogList
                    logs={recentActivity}
                    medicationsById={medicationsById}
                    emptyMessage="Patient activity will appear here after dose logging begins."
                  />
                </div>
              </Card>

              <HealthNotesCard notes={notes} readOnly />
            </div>
          </section>
        </>
      )}
    </div>
  )
}
