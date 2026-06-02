import Button from './Button'
import Card from './Card'
import HealthMetricTable from './HealthMetricTable'
import { formatDisplayDate } from '../utils/familyHealth'

function MedicationList({ medications }) {
  if (medications.length === 0) {
    return null
  }

  return (
    <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/70">
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Prescription intelligence</p>
      <div className="mt-3 space-y-3">
        {medications.map((medication) => (
          <article key={`${medication.name}-${medication.dosage}-${medication.frequency}`}>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {[medication.name, medication.dosage].filter(Boolean).join(' · ') || 'Medication'}
            </p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {[medication.frequency, medication.purpose].filter(Boolean).join(' · ') || 'No structured frequency or purpose extracted.'}
            </p>
            {medication.explanation ? (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{medication.explanation}</p>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  )
}

export default function ReportVaultList({ reports, onDelete, onSelectTest }) {
  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <Card key={report.id}>
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-500 dark:text-blue-300">
                {report.category.replace('-', ' ')}
              </p>
              <h3 className="mt-2 text-xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
                {report.reportTitle || report.fileName}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {report.familyMemberName} · {formatDisplayDate(report.reportDate || report.uploadedAt)}
              </p>
            </div>

            <Button type="button" variant="ghost" size="sm" onClick={() => onDelete(report)}>
              Delete
            </Button>
          </div>

          {report.healthCard?.keyFindings?.length > 0 ? (
            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/70">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Key findings</p>
              <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                {report.healthCard.keyFindings.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-4">
            <HealthMetricTable tests={report.tests || []} onSelectTest={onSelectTest} />
          </div>

          <MedicationList medications={report.medications || []} />
        </Card>
      ))}
    </div>
  )
}
