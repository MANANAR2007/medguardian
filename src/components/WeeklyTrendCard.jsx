import Card from './Card'
import SectionHeader from './SectionHeader'

function getBarHeightClass(day) {
  if (day.totalScheduled === 0) {
    return 'h-1'
  }

  if (day.adherencePercentage >= 90) {
    return 'h-full'
  }

  if (day.adherencePercentage >= 75) {
    return 'h-20'
  }

  if (day.adherencePercentage >= 60) {
    return 'h-16'
  }

  if (day.adherencePercentage >= 40) {
    return 'h-12'
  }

  if (day.adherencePercentage >= 20) {
    return 'h-8'
  }

  return 'h-3'
}

export default function WeeklyTrendCard({ trend }) {
  const hasData = trend.some((day) => day.totalScheduled > 0)

  return (
    <Card>
      <SectionHeader
        eyebrow="Weekly trend"
        title="Adherence by day"
        description="A quick seven-day view of scheduled dose completion."
        compact
      />

      <div className="mt-4 grid grid-cols-7 gap-2">
        {trend.map((day) => (
          <div key={day.dateKey} className="flex min-h-32 flex-col items-center justify-end gap-3">
            <div className="flex h-24 w-full items-end rounded-full bg-gray-100 p-1 dark:bg-gray-800">
              <div
                className={[
                  'w-full rounded-full transition-all duration-500',
                  day.adherencePercentage >= 70 ? 'bg-green-500' : day.totalScheduled > 0 ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-700',
                  getBarHeightClass(day),
                ].join(' ')}
                aria-label={`${day.label}: ${day.adherencePercentage}% adherence`}
              />
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-gray-700 dark:text-gray-200">{day.label}</p>
              <p className="text-[0.68rem] text-gray-400 dark:text-gray-500">
                {day.totalScheduled ? `${day.adherencePercentage}%` : '-'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {!hasData ? (
        <p className="mt-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800/70 dark:text-gray-400">
          Add medications and log doses to build a weekly trend.
        </p>
      ) : null}
    </Card>
  )
}
