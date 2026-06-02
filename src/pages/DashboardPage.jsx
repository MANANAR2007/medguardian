import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import HealthSummaryCard from '../components/HealthSummaryCard'
import SectionHeader from '../components/SectionHeader'
import StatCard from '../components/StatCard'
import { useFamilyHealth } from '../hooks/useFamilyHealth'
import { buildTrendNarrative, formatDisplayDate } from '../utils/familyHealth'

export default function DashboardPage() {
  const {
    abnormalTestCount,
    activeFamilyMember,
    dataLoading,
    familyMembers,
    followUps,
    healthAlerts,
    keyFindings,
    latestHealthScore,
    latestReport,
    recentReports,
    reportsForActiveMember,
    timelineMap,
  } = useFamilyHealth()

  const trendSpotlight = timelineMap.entries().next().value || null

  return (
    <div className="space-y-6">
      <Card>
        <SectionHeader
          eyebrow="Family dashboard"
          title={activeFamilyMember ? `${activeFamilyMember.name}'s health snapshot` : 'Family Health Companion'}
          description={
            activeFamilyMember
              ? `Track reports, abnormal values, follow-ups, and AI-extracted insights for ${activeFamilyMember.relation.toLowerCase()}.`
              : 'Start by creating a family profile, then upload reports and prescriptions into the vault.'
          }
        />
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Family profiles" value={familyMembers.length} helper="Profiles under this account" loading={dataLoading} />
        <StatCard label="Reports" value={reportsForActiveMember.length} helper="For the selected family member" loading={dataLoading} />
        <StatCard
          label="Health score"
          value={typeof latestHealthScore === 'number' ? latestHealthScore : '--'}
          helper="Latest patient-friendly health card"
          loading={dataLoading}
          tone={typeof latestHealthScore === 'number' && latestHealthScore < 60 ? 'danger' : 'success'}
        />
        <StatCard
          label="Abnormal values"
          value={abnormalTestCount}
          helper="High or low extracted tests"
          loading={dataLoading}
          tone={abnormalTestCount > 0 ? 'warning' : 'success'}
        />
      </section>

      {!activeFamilyMember ? (
        <EmptyState
          title="No family profile selected"
          description="Create your first family member to start building a private family health record vault."
        />
      ) : (
        <>
          <section className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
            <Card>
              <SectionHeader
                eyebrow="Recent reports"
                title="Latest uploads"
                description="The newest reports saved for this family member."
                compact
              />
              <div className="mt-4 space-y-3">
                {recentReports.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800/70 dark:text-gray-400">
                    No reports uploaded yet.
                  </div>
                ) : (
                  recentReports.map((report) => (
                    <article key={report.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/70">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{report.reportTitle || report.fileName}</p>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {report.category.replace('-', ' ')} · {formatDisplayDate(report.reportDate || report.uploadedAt)}
                      </p>
                    </article>
                  ))
                )}
              </div>
            </Card>

            <Card>
              <SectionHeader
                eyebrow="Health alerts"
                title="What needs attention"
                description="Abnormal values and follow-up items from uploaded records."
                compact
              />
              <div className="mt-4 space-y-4">
                <section>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Alerts</p>
                  <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    {(healthAlerts.length > 0
                      ? healthAlerts.map((alert) => `${alert.title} — ${alert.description}`)
                      : ['No active health alerts extracted yet.']).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>

                <section>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Recommended follow-ups</p>
                  <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    {(followUps.length > 0 ? followUps : ['No follow-up actions available yet.']).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>

                <section>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Positive indicators</p>
                  <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    {(keyFindings.length > 0 ? keyFindings : ['No positive indicators available yet.']).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
              </div>
            </Card>
          </section>

          <Card>
            <SectionHeader
              eyebrow="Trend spotlight"
              title={trendSpotlight ? trendSpotlight[0] : 'No trend data yet'}
              description={
                trendSpotlight
                  ? buildTrendNarrative(trendSpotlight[1])
                  : 'Upload more than one report with numeric test values to start tracking health changes over time.'
              }
              compact
            />
            {trendSpotlight ? (
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {trendSpotlight[1].slice(-3).map((point) => (
                  <article key={`${point.label}-${point.value}`} className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/70">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{point.label}</p>
                    <p className="mt-2 text-2xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
                      {point.rawValue}
                      {point.unit ? <span className="ml-1 text-sm font-semibold text-gray-500 dark:text-gray-400">{point.unit}</span> : null}
                    </p>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{point.status || 'Unknown'}</p>
                  </article>
                ))}
              </div>
            ) : null}
          </Card>

          {latestReport?.healthCard ? (
            <HealthSummaryCard healthCard={latestReport.healthCard} reportTitle={latestReport.reportTitle} />
          ) : (
            <EmptyState
              title="No analyzed health card yet"
              description="Upload a report or prescription to generate a patient-friendly health summary that keeps the original numbers visible."
            />
          )}
        </>
      )}
    </div>
  )
}
