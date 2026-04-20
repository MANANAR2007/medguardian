import { formatDateTimeLabel, formatTimeLabel } from '../utils/schedule'

const statusClasses = {
  taken: 'bg-green-50 text-green-700 ring-green-200 dark:bg-green-950/40 dark:text-green-300 dark:ring-green-900',
  missed: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-900',
}

export default function ActivityLogList({ logs, medicationsById, emptyMessage }) {
  if (logs.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800/70 dark:text-gray-400">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {logs.map((log) => {
        const medication = medicationsById[log.medicationId]

        return (
          <article
            key={log.id}
            className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900 md:flex-row md:items-center md:justify-between"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                {medication?.name ?? 'Medication removed'}
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {log.scheduledTime ? `${formatTimeLabel(log.scheduledTime)} scheduled dose` : 'Dose activity'}
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500">
                {formatDateTimeLabel(log.timestamp)}
              </p>
            </div>

            <span
              className={[
                'inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] ring-1',
                statusClasses[log.status] ?? statusClasses.missed,
              ].join(' ')}
            >
              {log.status}
            </span>
          </article>
        )
      })}
    </div>
  )
}
