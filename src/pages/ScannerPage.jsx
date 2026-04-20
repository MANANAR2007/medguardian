import { useCallback, useState } from 'react'
import Card from '../components/Card'
import MedicationForm from '../components/MedicationForm'
import PrescriptionScanner from '../components/PrescriptionScanner'
import SectionHeader from '../components/SectionHeader'
import { useMedicationData } from '../hooks/useMedicationData'

export default function ScannerPage() {
  const { addMedication, medications } = useMedicationData()
  const [scannerDraft, setScannerDraft] = useState(null)
  const [saveFeedback, setSaveFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreateMedication = useCallback(async (input) => {
    setIsSubmitting(true)
    setSaveFeedback('Saving in background...')

    try {
      await addMedication(input)
      setScannerDraft(null)
      setSaveFeedback('Saved ✓')
    } finally {
      setIsSubmitting(false)
      window.setTimeout(() => setSaveFeedback(''), 2200)
    }
  }, [addMedication])

  return (
    <div className="space-y-6">
      <Card>
        <SectionHeader
          eyebrow="Scanner"
          title="Scan and review prescriptions"
          description="Upload a prescription image, review extracted medications, then save only after the form looks right."
        />
      </Card>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <PrescriptionScanner onMedicationExtracted={setScannerDraft} />
        <MedicationForm
          key={JSON.stringify(scannerDraft) ?? 'scanner-medication'}
          draftValues={scannerDraft}
          onSubmit={handleCreateMedication}
          isSubmitting={isSubmitting}
          existingMedications={medications}
          saveFeedback={saveFeedback}
        />
      </div>
    </div>
  )
}
