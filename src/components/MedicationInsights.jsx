import { useMemo, useState } from 'react'
import { generateMedicationInsights } from '../services/gemini'
import Button from './Button'
import Card from './Card'
import SectionHeader from './SectionHeader'
import Skeleton from './Skeleton'

function createMedicationPreview(medications) {
  if (medications.length === 0) {
    return 'Insights will become available once medication data is connected to this component.'
  }

  return medications
    .map((medication) => `${medication.name} ${medication.dosage} ${medication.frequency}`)
    .join(' • ')
}

function extractSection(text, section) {
  const match = text.match(new RegExp(`${section}:\\s*([\\s\\S]*?)(?=\\n(?:Risk|Insight|Action):|$)`, 'i'))
  return (
    match?.[1]
      ?.split('\n')
      .map((line) => line.replace(/^[-*]\s*/, '').trim())
      .filter(Boolean) ?? []
  )
}

function parseInsights(text) {
  if (!text) {
    return {
      risk: [],
      insight: [],
      action: [],
    }
  }

  return {
    risk: extractSection(text, 'Risk'),
    insight: extractSection(text, 'Insight'),
    action: extractSection(text, 'Action'),
  }
}

function InsightCard({ title, items, tone }) {
  const toneClasses = {
    risk: 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-300',
    insight: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-300',
    action: 'border-green-200 bg-green-50 text-green-700 dark:border-green-900/70 dark:bg-green-950/30 dark:text-green-300',
  }

  return (
    <article className={['rounded-xl border p-4', toneClasses[tone]].join(' ')}>
      <p className="text-xs font-bold uppercase tracking-[0.2em]">{title}</p>
      <div className="mt-3 space-y-2">
        {(items.length > 0 ? items : ['Generate insights to fill this card.']).map((item) => (
          <p key={item} className="text-sm leading-6">
            {item}
          </p>
        ))}
      </div>
    </article>
  )
}

export default function MedicationInsights({
  medications = [],
  adherence,
  missedPatterns = [],
}) {
  const [insights, setInsights] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const hasMedications = medications.length > 0
  const medicationPreview = useMemo(() => createMedicationPreview(medications), [medications])
  const parsedInsights = useMemo(() => parseInsights(insights), [insights])

  async function handleGenerateInsights() {
    if (!hasMedications || isLoading) {
      return
    }

    setIsLoading(true)
    setErrorMessage('')

    try {
      const data = await generateMedicationInsights({
        medications,
        adherence,
        missedPatterns,
      })

      if (!data.insights) {
        throw new Error('AI failed, try again')
      }

      setInsights(data.insights)
    } catch (error) {
      setErrorMessage(error.message || 'AI failed, try again')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <SectionHeader
        eyebrow="AI insights"
        title="Medication intelligence"
        description="Generate a focused risk, behavior, and action summary based on medication names, adherence, and missed-dose patterns."
        compact
        action={
          <Button type="button" onClick={handleGenerateInsights} disabled={!hasMedications || isLoading}>
            {isLoading ? 'Generating...' : 'Generate Insights'}
          </Button>
        }
      />

      <p className="mt-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-600 dark:border-gray-700 dark:bg-gray-800/70 dark:text-gray-300">
        {medicationPreview}
      </p>

      {errorMessage ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/70 dark:bg-red-950/35 dark:text-red-300">
          {errorMessage}
        </div>
      ) : null}

      {isLoading ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : (
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <InsightCard title="Risk" tone="risk" items={parsedInsights.risk} />
          <InsightCard title="Insight" tone="insight" items={parsedInsights.insight} />
          <InsightCard title="Action" tone="action" items={parsedInsights.action} />
        </div>
      )}
    </Card>
  )
}
