import { useMemo, useState } from 'react'
import Button from './Button'
import Card from './Card'
import InputField from './InputField'
import SectionHeader from './SectionHeader'
import { checkMedicationInteractions } from '../utils/interactions'
import { normalizeTimes } from '../utils/schedule'

const defaultFormState = {
  name: '',
  dosage: '',
  frequency: 'daily',
  times: ['08:00'],
}

const quickAddTemplates = [
  {
    label: 'Pain relief',
    values: {
      name: 'Paracetamol',
      dosage: '500mg',
      frequency: 'daily',
      times: ['08:00', '20:00'],
    },
  },
  {
    label: 'Anti-inflammatory',
    values: {
      name: 'Ibuprofen',
      dosage: '200mg',
      frequency: 'daily',
      times: ['13:00'],
    },
  },
  {
    label: 'Supplement',
    values: {
      name: 'Vitamin D',
      dosage: '1000 IU',
      frequency: 'daily',
      times: ['09:00'],
    },
  },
]

export default function MedicationForm({
  initialValues,
  draftValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  existingMedications = [],
  saveFeedback = '',
}) {
  const [formData, setFormData] = useState(initialValues ?? draftValues ?? defaultFormState)
  const [errorMessage, setErrorMessage] = useState('')

  const previewWarnings = useMemo(() => {
    const previewMedication = {
      id: initialValues?.id ?? 'draft-medication',
      name: formData.name,
      dosage: formData.dosage,
      frequency: formData.frequency,
      times: normalizeTimes(formData.times),
    }

    const filteredExisting = existingMedications.filter((medication) => medication.id !== initialValues?.id)
    return checkMedicationInteractions([...filteredExisting, previewMedication]).warnings
  }, [existingMedications, formData, initialValues?.id])

  function updateField(name, value) {
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  function updateTime(index, value) {
    setFormData((previous) => ({
      ...previous,
      times: previous.times.map((time, timeIndex) => (timeIndex === index ? value : time)),
    }))
  }

  function addTimeField() {
    setFormData((previous) => ({
      ...previous,
      times: [...previous.times, '12:00'],
    }))
  }

  function removeTimeField(index) {
    setFormData((previous) => ({
      ...previous,
      times: previous.times.filter((_, timeIndex) => timeIndex !== index),
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')

    const normalizedTimes = normalizeTimes(formData.times)

    if (!formData.name.trim() || !formData.dosage.trim() || normalizedTimes.length === 0) {
      setErrorMessage('Please complete the medication name, dosage, and at least one time.')
      return
    }

    try {
      await onSubmit({
        ...formData,
        name: formData.name.trim(),
        dosage: formData.dosage.trim(),
        times: normalizedTimes,
      })

      if (!initialValues) {
        setFormData(defaultFormState)
      }
    } catch (error) {
      setErrorMessage(error.message || 'Unable to save this medication.')
    }
  }

  return (
    <Card as="form" className="space-y-4" onSubmit={handleSubmit}>
      <SectionHeader
        eyebrow={initialValues ? 'Edit medication' : 'Add medication'}
        title={initialValues ? 'Update details' : 'New medication'}
        compact
      />

      {!initialValues ? (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/70">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Quick-add templates</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {quickAddTemplates.map((template) => (
              <Button
                key={template.label}
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setFormData(template.values)}
              >
                {template.label}
              </Button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <InputField
          id="medication-name"
          label="Medication name"
          name="name"
          placeholder="Paracetamol"
          value={formData.name}
          onChange={(event) => updateField('name', event.target.value)}
          required
        />

        <InputField
          id="medication-dosage"
          label="Dosage"
          name="dosage"
          placeholder="500mg"
          value={formData.dosage}
          onChange={(event) => updateField('dosage', event.target.value)}
          required
        />
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">Frequency</span>
        <select
          value={formData.frequency}
          onChange={(event) => updateField('frequency', event.target.value)}
          className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-950"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
      </label>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Scheduled times</p>
          <Button type="button" variant="secondary" size="sm" onClick={addTimeField}>
            Add time
          </Button>
        </div>

        {formData.times.map((time, index) => (
          <div key={`${time}-${index}`} className="flex items-center gap-3">
            <input
              type="time"
              value={time}
              onChange={(event) => updateTime(index, event.target.value)}
              className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-950"
            />

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeTimeField(index)}
              disabled={formData.times.length === 1}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>

      {previewWarnings.length > 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/35 dark:text-amber-300">
          <p className="font-semibold">Interaction check</p>
          <ul className="mt-2 space-y-2">
            {previewWarnings.map((warning) => (
              <li key={warning.id}>{warning.warning}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/70 dark:bg-red-950/35 dark:text-red-300">
          {errorMessage}
        </div>
      ) : null}

      {saveFeedback ? (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 dark:border-green-900/70 dark:bg-green-950/35 dark:text-green-300">
          {saveFeedback}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : initialValues ? 'Save changes' : 'Add medication'}
        </Button>
        {onCancel ? (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </Card>
  )
}
