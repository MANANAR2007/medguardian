import { useMemo } from 'react'
import ActivityLogList from '../components/ActivityLogList'
import Card from '../components/Card'
import MedicationInsights from '../components/MedicationInsights'
import SectionHeader from '../components/SectionHeader'
import StatCard from '../components/StatCard'
import WeeklyTrendCard from '../components/WeeklyTrendCard'
import { useMedicationData } from '../hooks/useMedicationData'
import { formatTimeLabel } from '../utils/schedule'

export default function InsightsPage() {
  const { adherence, dataLoading, logs, medications, medicationsById, weeklyTrend } = useMedicationData()

  const missedPatterns = useMemo(
    () =>
      logs
        .filter((log) => log.status === 'missed')
        .slice(0, 5)
        .map((log) => {
          const medication = medicationsById[log.medicationId]
          return `${medication?.name ?? 'Medication'} missed at ${formatTimeLabel(log.scheduledTime)}`
        }),
    [logs, medicationsById],
  )

  return (
    <div className="space-y-6">
      <Card>
        <SectionHeader
          eyebrow="Insights"
          title="Understand medication behavior"
          description="Review adherence patterns, missed-dose activity, and AI-generated guidance grounded in your actual medication data."
        />
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Adherence"
          value={`${adherence.adherencePercentage}%`}
          loading={dataLoading}
          helper={`Last ${adherence.windowDays} days`}
          tone={adherence.adherencePercentage < 70 && medications.length > 0 ? 'danger' : 'success'}
        />
        <StatCard label="Taken" value={adherence.totalTaken} loading={dataLoading} helper="Logged doses" tone="success" />
        <StatCard
          label="Missed"
          value={adherence.totalMissed}
          loading={dataLoading}
          helper="Missed dose logs"
          tone={adherence.totalMissed >= 2 ? 'danger' : 'default'}
        />
        <StatCard
          label="Streak"
          value={`${adherence.streakDays} day${adherence.streakDays === 1 ? '' : 's'}`}
          loading={dataLoading}
          helper="Fully completed days"
          tone={adherence.streakDays > 0 ? 'success' : 'warning'}
        />
      </section>

      <MedicationInsights
        medications={medications.map(({ name, dosage, frequency }) => ({
          name,
          dosage,
          frequency,
        }))}
        adherence={adherence}
        missedPatterns={missedPatterns}
      />

      <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <WeeklyTrendCard trend={weeklyTrend} />

        <Card>
          <SectionHeader eyebrow="Missed patterns" title="Recent misses" compact />
          <div className="mt-4">
            <ActivityLogList
              logs={logs.filter((log) => log.status === 'missed').slice(0, 6)}
              medicationsById={medicationsById}
              emptyMessage="No missed-dose pattern is available yet."
            />
          </div>
        </Card>
      </section>
    </div>
  )
}
