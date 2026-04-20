import { Link } from 'react-router-dom'
import ActivityLogList from '../components/ActivityLogList'
import AlertCard from '../components/AlertCard'
import Button from '../components/Button'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import SectionHeader from '../components/SectionHeader'
import StatCard from '../components/StatCard'
import WeeklyTrendCard from '../components/WeeklyTrendCard'
import { useAuth } from '../hooks/useAuth'
import { useMedicationData } from '../hooks/useMedicationData'
import { ROUTES } from '../utils/routes'

export default function DashboardPage() {
  const { currentUser, userProfile } = useAuth()
  const { adherence, dataLoading, interactionWarnings, logs, medications, medicationsById, weeklyTrend } =
    useMedicationData()

  const recentLogs = logs.slice(0, 5)
  const hasCriticalMisses = adherence.totalMissed >= 2
  const hasLowAdherence = medications.length > 0 && adherence.adherencePercentage < 70

  return (
    <div className="space-y-6">
      <Card>
        <SectionHeader
          eyebrow="Dashboard"
          title={`Welcome back${currentUser?.email ? `, ${currentUser.email.split('@')[0]}` : ''}.`}
          description="Your medication health summary, alerts, weekly progress, and recent dose activity in one focused view."
          action={
            <Link to={ROUTES.medications}>
              <Button>Manage medications</Button>
            </Link>
          }
        />
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Adherence"
          value={`${adherence.adherencePercentage}%`}
          loading={dataLoading}
          helper={`Last ${adherence.windowDays} days`}
          tone={hasLowAdherence ? 'danger' : 'success'}
        />
        <StatCard
          label="Missed doses"
          value={adherence.totalMissed}
          loading={dataLoading}
          helper="Current window"
          tone={hasCriticalMisses ? 'danger' : 'default'}
        />
        <StatCard
          label="Medication streak"
          value={`${adherence.streakDays} day${adherence.streakDays === 1 ? '' : 's'}`}
          loading={dataLoading}
          helper="Fully completed days"
          tone={adherence.streakDays > 0 ? 'success' : 'warning'}
        />
        <StatCard
          label="Caregiver"
          value={userProfile?.linkedCaregiverId ? 'Connected' : 'Not linked'}
          helper={userProfile?.linkedCaregiverId ? 'Monitoring enabled' : 'Private account'}
          tone={userProfile?.linkedCaregiverId ? 'success' : 'warning'}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4">
          {hasCriticalMisses ? (
            <AlertCard
              tone="danger"
              title="Missed dose alert"
              message="Two or more doses were marked as missed in the last 7 days. Review the schedule and activity log."
            />
          ) : null}

          {hasLowAdherence ? (
            <AlertCard
              tone="warning"
              title="Low adherence warning"
              message="Your adherence score is below 70%. Consider adjusting reminders or discussing barriers with a healthcare professional."
            />
          ) : null}

          {interactionWarnings.length > 0 ? (
            <AlertCard
              tone="warning"
              title="Medication warning"
              message={interactionWarnings.map((warning) => warning.warning).join(' ')}
            />
          ) : null}

          {!hasCriticalMisses && !hasLowAdherence && interactionWarnings.length === 0 ? (
            <AlertCard
              tone="info"
              title="No urgent alerts"
              message="No critical medication alerts are currently active."
            />
          ) : null}

          <WeeklyTrendCard trend={weeklyTrend} />
        </div>

        <Card>
          <SectionHeader
            eyebrow="Recent activity"
            title="Latest dose logs"
            description="The newest taken and missed dose actions."
            compact
          />
          <div className="mt-4">
            <ActivityLogList
              logs={recentLogs}
              medicationsById={medicationsById}
              emptyMessage="Dose activity will appear here after you mark medications as taken or missed."
            />
          </div>
        </Card>
      </section>

      {medications.length === 0 && !dataLoading ? (
        <EmptyState
          title="No medications added yet."
          description="Add your first medication to start tracking scheduled doses, missed doses, streaks, and adherence."
          action={
            <Link to={ROUTES.medications}>
              <Button>Add medications</Button>
            </Link>
          }
        />
      ) : null}
    </div>
  )
}
