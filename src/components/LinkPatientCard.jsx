import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import Button from './Button'
import Card from './Card'
import InputField from './InputField'
import SectionHeader from './SectionHeader'

export default function LinkPatientCard({ linkedPatientProfile }) {
  const { linkPatientAccount } = useAuth()
  const [identifier, setIdentifier] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorMessage('')
    setMessage('')

    try {
      const patient = await linkPatientAccount(identifier)
      setMessage(`Linked to patient ${patient.email}.`)
      setIdentifier('')
    } catch (error) {
      setErrorMessage(error.message || 'Unable to link this patient right now.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <SectionHeader
        eyebrow="Caregiver linking"
        title="Link a patient account"
        description="Enter a patient UID or email to view that patient’s medications, logs, adherence score, and missed-dose alerts."
        compact
      />

      {linkedPatientProfile ? (
        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900/70 dark:bg-green-950/35 dark:text-green-300">
          Currently linked to <span className="font-semibold">{linkedPatientProfile.email}</span>.
        </div>
      ) : null}

      <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
        <InputField
          id="patient-identifier"
          label="Patient UID or email"
          name="identifier"
          placeholder="patient UID or patient@example.com"
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          required
        />

        {message ? (
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900/70 dark:bg-green-950/35 dark:text-green-300">
            {message}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/70 dark:bg-red-950/35 dark:text-red-300">
            {errorMessage}
          </div>
        ) : null}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Linking...' : linkedPatientProfile ? 'Update link' : 'Link patient'}
        </Button>
      </form>
    </Card>
  )
}
