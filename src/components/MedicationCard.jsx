import Button from './Button'
import { formatTimeLabel } from '../utils/schedule'

const statusMap = {
  taken: 'bg-green-50 text-green-700 ring-green-200 dark:bg-green-950/40 dark:text-green-300 dark:ring-green-900',
  missed: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-900',
  pending: 'bg-gray-100 text-gray-600 ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700',
  upcoming: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900',
}

function Badge({ children, className = '' }) {
  return (
    <span
      className={[
        'inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-[0.14em] ring-1',
        className,
      ].join(' ')}
    >
      {children}
    </span>
  )
}

export default function MedicationCard({
  medication,
  scheduledTime,
  status = 'pending',
  dueToday = true,
  readOnly = false,
  warnings = [],
  onEdit,
  onDelete,
  onLogDose,
}) {
  const resolvedStatus = dueToday ? status : 'upcoming'
  const isLogged = status === 'taken' || status === 'missed'

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-gray-700 dark:bg-gray-900">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-sm font-extrabold text-blue-600 dark:bg-blue-950/50 dark:text-blue-300">
              {medication.name?.slice(0, 1).toUpperCase() || 'M'}
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-extrabold text-gray-900 dark:text-gray-100">{medication.name}</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{medication.dosage}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge className="bg-gray-100 text-gray-600 ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700">
              {medication.frequency}
            </Badge>
            <Badge className="bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-900">
              {formatTimeLabel(scheduledTime)}
            </Badge>
            <Badge className={statusMap[resolvedStatus]}>
              {dueToday ? resolvedStatus : 'not due'}
            </Badge>
            {medication._saving ? (
              <Badge className="bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-900">
                Saving
              </Badge>
            ) : null}
            {medication._saved ? (
              <Badge className="bg-green-50 text-green-700 ring-green-200 dark:bg-green-950/40 dark:text-green-300 dark:ring-green-900">
                Saved
              </Badge>
            ) : null}
          </div>
        </div>

        {readOnly ? null : (
          <div className="flex flex-wrap gap-2 xl:justify-end">
            <Button
              type="button"
              variant="success"
              size="sm"
              disabled={!dueToday || isLogged}
              onClick={() => onLogDose({ medicationId: medication.id, scheduledTime, status: 'taken' })}
            >
              Taken
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              disabled={!dueToday || isLogged}
              onClick={() => onLogDose({ medicationId: medication.id, scheduledTime, status: 'missed' })}
            >
              Missed
            </Button>
          </div>
        )}
      </div>

      {warnings.length > 0 ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/35 dark:text-amber-300">
          {warnings.map((warning) => (
            <p key={warning}>{warning}</p>
          ))}
        </div>
      ) : null}

      {readOnly ? null : (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4 dark:border-gray-800">
          <Button type="button" variant="secondary" size="sm" onClick={() => onEdit(medication)}>
            Edit
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => onDelete(medication)}>
            Delete
          </Button>
        </div>
      )}
    </article>
  )
}
