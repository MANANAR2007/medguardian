import { useState } from 'react'
import Button from './Button'
import Card from './Card'
import InputField from './InputField'
import SectionHeader from './SectionHeader'

const defaultValues = {
  name: '',
  relation: '',
  birthYear: '',
  gender: '',
}

export default function FamilyMemberForm({
  initialValues,
  isSubmitting = false,
  onCancel,
  onSubmit,
}) {
  const [formData, setFormData] = useState(initialValues || defaultValues)
  const [errorMessage, setErrorMessage] = useState('')

  function updateField(name, value) {
    setFormData((current) => ({
      ...current,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')

    if (!formData.name.trim() || !formData.relation.trim()) {
      setErrorMessage('Name and relation are required.')
      return
    }

    try {
      await onSubmit({
        name: formData.name.trim(),
        relation: formData.relation.trim(),
        birthYear: formData.birthYear.trim(),
        gender: formData.gender.trim(),
      })

      if (!initialValues) {
        setFormData(defaultValues)
      }
    } catch (error) {
      setErrorMessage(error.message || 'Unable to save this family profile.')
    }
  }

  return (
    <Card as="form" className="space-y-4" onSubmit={handleSubmit}>
      <SectionHeader
        eyebrow={initialValues ? 'Edit family profile' : 'Add family profile'}
        title={initialValues ? 'Update family member' : 'Create a new family member'}
        description="Keep each profile separate so reports, trends, and summaries stay organized."
        compact
      />

      <div className="grid gap-4 md:grid-cols-2">
        <InputField
          id="family-name"
          label="Full name"
          value={formData.name}
          onChange={(event) => updateField('name', event.target.value)}
          placeholder="Anita Sharma"
          required
        />
        <InputField
          id="family-relation"
          label="Relation"
          value={formData.relation}
          onChange={(event) => updateField('relation', event.target.value)}
          placeholder="Mother"
          required
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <InputField
          id="family-birth-year"
          label="Birth year"
          value={formData.birthYear}
          onChange={(event) => updateField('birthYear', event.target.value)}
          placeholder="1962"
        />
        <InputField
          id="family-gender"
          label="Gender"
          value={formData.gender}
          onChange={(event) => updateField('gender', event.target.value)}
          placeholder="Female"
        />
      </div>

      {errorMessage ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/70 dark:bg-red-950/35 dark:text-red-300">
          {errorMessage}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : initialValues ? 'Save changes' : 'Add family member'}
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
