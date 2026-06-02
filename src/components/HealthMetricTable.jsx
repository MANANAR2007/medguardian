import { getStatusBadgeClasses } from '../utils/familyHealth'

export default function HealthMetricTable({ tests, onSelectTest }) {
  if (tests.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800/70 dark:text-gray-400">
        No structured lab values were extracted from this document.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-left dark:divide-gray-700">
        <thead>
          <tr className="text-xs uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500">
            <th className="py-3 pr-4 font-bold">Test</th>
            <th className="py-3 pr-4 font-bold">Your value</th>
            <th className="py-3 pr-4 font-bold">Normal range</th>
            <th className="py-3 pr-4 font-bold">Status</th>
            <th className="py-3 font-bold">Explain</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {tests.map((test) => (
            <tr key={`${test.test}-${test.value}-${test.referenceRange}`} className="align-top">
              <td className="py-3 pr-4 text-sm font-semibold text-gray-900 dark:text-gray-100">{test.test}</td>
              <td className="py-3 pr-4 text-sm text-gray-600 dark:text-gray-300">
                {[test.value, test.unit].filter(Boolean).join(' ') || '--'}
              </td>
              <td className="py-3 pr-4 text-sm text-gray-600 dark:text-gray-300">{test.referenceRange || '--'}</td>
              <td className="py-3 pr-4">
                <span className={['inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] ring-1', getStatusBadgeClasses(test.status)].join(' ')}>
                  {test.status || 'Unknown'}
                </span>
              </td>
              <td className="py-3">
                <button
                  type="button"
                  onClick={() => onSelectTest?.(test)}
                  className="text-sm font-semibold text-blue-600 transition hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200"
                >
                  Explain
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
