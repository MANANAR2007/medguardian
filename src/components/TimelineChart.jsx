import Card from './Card'
import SectionHeader from './SectionHeader'
import { buildTrendNarrative, getStatusBadgeClasses } from '../utils/familyHealth'

function getBarWidthClass(pointValue, maxValue) {
  const ratio = maxValue > 0 ? pointValue / maxValue : 0

  if (ratio >= 0.9) return 'w-full'
  if (ratio >= 0.75) return 'w-5/6'
  if (ratio >= 0.6) return 'w-4/6'
  if (ratio >= 0.45) return 'w-3/6'
  if (ratio >= 0.3) return 'w-2/6'
  if (ratio >= 0.15) return 'w-1/6'
  return 'w-[8%]'
}

export default function TimelineChart({ testName, points }) {
  const maxValue = Math.max(...points.map((point) => point.value), 1)

  return (
    <Card>
      <SectionHeader
        eyebrow="Health timeline"
        title={testName}
        description={buildTrendNarrative(points)}
        compact
      />

      <div className="mt-5 space-y-4">
        {points.map((point) => (
          <div key={`${point.label}-${point.value}`} className="grid gap-3 md:grid-cols-[8rem_1fr_9rem] md:items-center">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{point.label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{point.rawValue} {point.unit}</p>
            </div>

            <div className="h-3 rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                className={['h-3 rounded-full bg-blue-500', getBarWidthClass(point.value, maxValue)].join(' ')}
              />
            </div>

            <div className="md:text-right">
              <span className={['inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] ring-1', getStatusBadgeClasses(point.status)].join(' ')}>
                {point.status || 'Unknown'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
