import Card from './Card'
import SectionHeader from './SectionHeader'

function SummaryList({ title, items, emptyLabel }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/70">
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{title}</p>
      <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
        {(items.length > 0 ? items : [emptyLabel]).map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  )
}

export default function DoctorSummaryCard({ summary }) {
  return (
    <Card>
      <SectionHeader
        eyebrow="Doctor summary"
        title={summary?.headline || 'Clinical summary'}
        description={summary?.summary || 'Generate a concise doctor-facing summary from uploaded family health records.'}
        compact
      />

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <SummaryList
          title="Important abnormalities"
          items={summary?.importantAbnormalities || []}
          emptyLabel="No critical abnormalities were summarized."
        />
        <SummaryList
          title="Trends"
          items={summary?.trends || []}
          emptyLabel="No trend analysis was available."
        />
        <SummaryList
          title="Medication changes"
          items={summary?.medicationChanges || []}
          emptyLabel="No medication changes were identified."
        />
        <SummaryList
          title="Recommended follow-ups"
          items={summary?.recommendedFollowUps || []}
          emptyLabel="No follow-up items were suggested."
        />
      </div>
    </Card>
  )
}
