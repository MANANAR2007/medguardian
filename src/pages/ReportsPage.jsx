import { useMemo, useState } from 'react'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import HealthSummaryCard from '../components/HealthSummaryCard'
import ReportUploader from '../components/ReportUploader'
import ReportVaultList from '../components/ReportVaultList'
import SectionHeader from '../components/SectionHeader'
import TestExplanationModal from '../components/TestExplanationModal'
import { useFamilyHealth } from '../hooks/useFamilyHealth'
import { explainHealthTest } from '../services/gemini'

export default function ReportsPage() {
  const {
    activeFamilyMember,
    deleteReport,
    latestReport,
    reportsForActiveMember,
    uploadHealthDocument,
  } = useFamilyHealth()
  const [selectedExplanation, setSelectedExplanation] = useState(null)

  const hasReports = reportsForActiveMember.length > 0
  const latestSummaryCard = useMemo(() => latestReport?.healthCard || null, [latestReport])

  async function handleExplainTest(test) {
    const explanation = await explainHealthTest(test)
    setSelectedExplanation(explanation)
  }

  async function handleDelete(report) {
    const confirmed = window.confirm(`Delete ${report.reportTitle || report.fileName}?`)

    if (!confirmed) {
      return
    }

    await deleteReport(report.id)
  }

  return (
    <div className="space-y-6">
      <Card>
        <SectionHeader
          eyebrow="Report vault"
          title={activeFamilyMember ? `${activeFamilyMember.name}'s records` : 'Health documents'}
          description="Upload reports, prescriptions, images, and doctor notes. Family Health Companion extracts understandable insights without hiding original medical values."
        />
      </Card>

      <div className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
        <div className="space-y-6">
          <ReportUploader activeFamilyMember={activeFamilyMember} onUpload={uploadHealthDocument} />
          {latestSummaryCard ? <HealthSummaryCard healthCard={latestSummaryCard} reportTitle={latestReport?.reportTitle} /> : null}
        </div>

        <div className="space-y-6">
          {!hasReports ? (
            <EmptyState
              title="No reports in the vault yet"
              description="Upload a lab report, prescription, image, PDF, or doctor note to start building the family health record."
            />
          ) : (
            <ReportVaultList
              reports={reportsForActiveMember}
              onDelete={handleDelete}
              onSelectTest={handleExplainTest}
            />
          )}
        </div>
      </div>

      <TestExplanationModal explanation={selectedExplanation} onClose={() => setSelectedExplanation(null)} />
    </div>
  )
}
