import { useMemo, useState } from 'react'
import Button from '../components/Button'
import Card from '../components/Card'
import DoctorSummaryCard from '../components/DoctorSummaryCard'
import EmptyState from '../components/EmptyState'
import SectionHeader from '../components/SectionHeader'
import { useFamilyHealth } from '../hooks/useFamilyHealth'
import { generateDoctorSummary } from '../services/gemini'

export default function DoctorSummaryPage() {
  const { activeFamilyMember, reportsForActiveMember } = useFamilyHealth()
  const [summary, setSummary] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const existingSummary = useMemo(
    () => reportsForActiveMember.find((report) => report.doctorSummary?.summary)?.doctorSummary || null,
    [reportsForActiveMember],
  )

  async function handleGenerateSummary() {
    if (!activeFamilyMember || reportsForActiveMember.length === 0 || isLoading) {
      return
    }

    setIsLoading(true)
    setErrorMessage('')

    try {
      const result = await generateDoctorSummary({
        familyMemberName: activeFamilyMember.name,
        reports: reportsForActiveMember,
      })

      setSummary(result)
    } catch (error) {
      setErrorMessage(error.message || 'AI failed, try again')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <SectionHeader
          eyebrow="Doctor summary"
          title={activeFamilyMember ? `${activeFamilyMember.name}'s clinical summary` : 'Clinical summary'}
          description="Generate a concise doctor-facing overview with abnormalities, trends, and medication changes across uploaded reports."
          action={
            <Button
              type="button"
              onClick={handleGenerateSummary}
              disabled={!activeFamilyMember || reportsForActiveMember.length === 0 || isLoading}
            >
              {isLoading ? 'Generating...' : 'Generate summary'}
            </Button>
          }
        />
      </Card>

      {errorMessage ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/70 dark:bg-red-950/35 dark:text-red-300">
          {errorMessage}
        </div>
      ) : null}

      {!activeFamilyMember ? (
        <EmptyState
          title="No family profile selected"
          description="Choose a family member before generating a clinical summary."
        />
      ) : reportsForActiveMember.length === 0 ? (
        <EmptyState
          title="No reports available"
          description="Upload reports into the vault before generating a doctor summary."
        />
      ) : (
        <DoctorSummaryCard summary={summary || existingSummary} />
      )}
    </div>
  )
}
