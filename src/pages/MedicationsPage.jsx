import { useCallback, useMemo, useState } from 'react'
import AlertCard from '../components/AlertCard'
import ActivityLogList from '../components/ActivityLogList'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import HealthNotesCard from '../components/HealthNotesCard'
import MedicationForm from '../components/MedicationForm'
import MedicationScheduleList from '../components/MedicationScheduleList'
import SectionHeader from '../components/SectionHeader'
import StatCard from '../components/StatCard'
import { useMedicationData } from '../hooks/useMedicationData'
import { groupMedicationsByDaypart } from '../utils/schedule'

export default function MedicationsPage() {
  const {
    addNote,
    addMedication,
    adherence,
    dataError,
    dataLoading,
    deleteMedication,
    interactionWarnings,
    isDoseDueToday,
    logDose,
    logs,
    medications,
    medicationsById,
    notes,
    todayStatusMap,
    updateMedication,
    warningsByMedicationId,
  } = useMedicationData()

  const [editingMedication, setEditingMedication] = useState(null)
  const [saveFeedback, setSaveFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const groupedMedications = useMemo(() => groupMedicationsByDaypart(medications), [medications])

  const handleCreateMedication = useCallback(async (input) => {
    setIsSubmitting(true)
    setSaveFeedback('Saving in background...')

    try {
      await addMedication(input)
      setSaveFeedback('Saved ✓')
    } finally {
      setIsSubmitting(false)
      window.setTimeout(() => setSaveFeedback(''), 2200)
    }
  }, [addMedication])

  const handleUpdateMedication = useCallback(async (input) => {
    setIsSubmitting(true)
    setSaveFeedback('Saving in background...')

    try {
      await updateMedication(editingMedication.id, input)
      setEditingMedication(null)
      setSaveFeedback('Saved ✓')
    } finally {
      setIsSubmitting(false)
      window.setTimeout(() => setSaveFeedback(''), 2200)
    }
  }, [editingMedication?.id, updateMedication])

  const handleDeleteMedication = useCallback(async (medication) => {
    const confirmed = window.confirm(`Delete ${medication.name}? This will also remove related dose logs.`)

    if (!confirmed) {
      return
    }

    await deleteMedication(medication.id)
  }, [deleteMedication])

  const handleLogDose = useCallback(async (input) => {
    await logDose(input)
  }, [logDose])

  return (
    <div className="space-y-6">
      <Card>
        <SectionHeader
          eyebrow="Medications"
          title="Manage your schedule"
          description="Add medications, update timing, log today’s doses, and keep the schedule clean."
        />
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Scheduled"
          value={adherence.totalScheduled}
          loading={dataLoading}
          helper={`Last ${adherence.windowDays} days`}
        />
        <StatCard label="Taken" value={adherence.totalTaken} loading={dataLoading} helper="Logged doses" tone="success" />
        <StatCard
          label="Missed"
          value={adherence.totalMissed}
          loading={dataLoading}
          helper="Needs attention"
          tone={adherence.totalMissed >= 2 ? 'danger' : 'default'}
        />
        <StatCard
          label="Adherence"
          value={`${adherence.adherencePercentage}%`}
          loading={dataLoading}
          helper="Taken divided by scheduled"
          tone={adherence.adherencePercentage < 70 && medications.length > 0 ? 'danger' : 'success'}
        />
      </section>

      {dataError ? <AlertCard title="Data warning" message={dataError} tone="warning" /> : null}

      {interactionWarnings.length > 0 ? (
        <AlertCard
          title="Interaction warning"
          message={interactionWarnings.map((warning) => warning.warning).join(' ')}
          tone="warning"
        />
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.86fr_1.14fr]">
        <div className="space-y-6">
          <MedicationForm
            key={editingMedication?.id ?? 'new-medication'}
            initialValues={editingMedication}
            onSubmit={editingMedication ? handleUpdateMedication : handleCreateMedication}
            onCancel={editingMedication ? () => setEditingMedication(null) : undefined}
            isSubmitting={isSubmitting}
            existingMedications={medications}
            saveFeedback={saveFeedback}
          />

          <HealthNotesCard notes={notes} onAddNote={addNote} />
        </div>

        <div className="space-y-6">
          {medications.length === 0 && !dataLoading ? (
            <EmptyState
              title="No medications yet"
              description="Once you add medications, they will be grouped by morning, afternoon, and evening here."
            />
          ) : (
            <MedicationScheduleList
              groups={groupedMedications}
              todayStatusMap={todayStatusMap}
              warningsByMedicationId={warningsByMedicationId}
              isDoseDueToday={isDoseDueToday}
              onEdit={setEditingMedication}
              onDelete={handleDeleteMedication}
              onLogDose={handleLogDose}
            />
          )}

          <Card>
            <SectionHeader
              eyebrow="Activity"
              title="Latest medication logs"
              description="Recent taken and missed dose actions."
              compact
            />
            <div className="mt-4">
              <ActivityLogList
                logs={logs.slice(0, 8)}
                medicationsById={medicationsById}
                emptyMessage="No doses have been logged yet. Mark a scheduled dose as taken or missed to start building the activity history."
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
