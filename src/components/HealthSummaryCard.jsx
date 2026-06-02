import Card from './Card'
import SectionHeader from './SectionHeader'

export default function HealthSummaryCard({ healthCard, reportTitle }) {
  return (
    <Card>
      <SectionHeader
        eyebrow="Patient-friendly health card"
        title={reportTitle || 'Latest health card'}
        description="A simple explanation of the latest structured findings while preserving original medical values."
        compact
      />

      <div className="mt-4 grid gap-4 xl:grid-cols-[0.34fr_0.66fr]">
        <div className="rounded-xl bg-blue-50 p-4 dark:bg-blue-950/30">
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-300">Health score</p>
          <p className="mt-2 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            {typeof healthCard?.healthScore === 'number' ? healthCard.healthScore : '--'}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <section className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/70">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Key findings</p>
            <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
              {(healthCard?.keyFindings || ['No key findings available yet.']).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/70">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Areas of concern</p>
            <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
              {(healthCard?.areasOfConcern || ['No major concerns listed.']).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/70">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Positive indicators</p>
            <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
              {(healthCard?.positiveIndicators || ['No positive indicators listed yet.']).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/70">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Recommended follow-ups</p>
            <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
              {(healthCard?.recommendedFollowUps || ['No follow-up guidance available.']).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </Card>
  )
}
