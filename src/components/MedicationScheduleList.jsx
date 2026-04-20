import MedicationCard from './MedicationCard'
import Card from './Card'
import SectionHeader from './SectionHeader'
import { getDateKey } from '../utils/schedule'

export default function MedicationScheduleList({
  groups,
  todayStatusMap,
  warningsByMedicationId,
  isDoseDueToday,
  onEdit,
  onDelete,
  onLogDose,
  readOnly = false,
}) {
  const todayKey = getDateKey()

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <Card key={group.period}>
          <SectionHeader
            eyebrow={group.description}
            title={group.label}
            compact
            action={
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-gray-500 dark:bg-gray-800 dark:text-gray-300">
                {group.items.length} dose{group.items.length === 1 ? '' : 's'}
              </span>
            }
          />

          <div className="mt-4 grid gap-4">
            {group.items.map(({ medication, time }) => (
              <MedicationCard
                key={`${medication.id}-${time}`}
                medication={medication}
                scheduledTime={time}
                status={todayStatusMap[`${medication.id}_${todayKey}_${time}`] ?? 'pending'}
                dueToday={isDoseDueToday(medication)}
                readOnly={readOnly}
                warnings={warningsByMedicationId[medication.id] ?? []}
                onEdit={onEdit}
                onDelete={onDelete}
                onLogDose={onLogDose}
              />
            ))}
          </div>
        </Card>
      ))}
    </div>
  )
}
