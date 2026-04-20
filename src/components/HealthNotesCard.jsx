import { useState } from 'react'
import { formatDateTimeLabel } from '../utils/schedule'
import Button from './Button'
import Card from './Card'
import SectionHeader from './SectionHeader'

export default function HealthNotesCard({ notes, onAddNote, readOnly = false }) {
  const [note, setNote] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')

    if (!note.trim()) {
      setErrorMessage('Add a short note before saving.')
      return
    }

    setIsSubmitting(true)

    try {
      await onAddNote(note)
      setNote('')
    } catch (error) {
      setErrorMessage(error.message || 'Unable to save this note.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <SectionHeader
        eyebrow="Health notes"
        title="Context for care"
        description={readOnly ? 'Patient notes appear here when available.' : 'Capture quick context that may affect adherence.'}
        compact
      />

      {readOnly ? null : (
        <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Example: Felt dizzy after evening dose."
            className="min-h-28 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-950"
          />

          {errorMessage ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/70 dark:bg-red-950/35 dark:text-red-300">
              {errorMessage}
            </div>
          ) : null}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save note'}
          </Button>
        </form>
      )}

      <div className="mt-4 space-y-3">
        {notes.length === 0 ? (
          <p className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800/70 dark:text-gray-400">
            No health notes yet.
          </p>
        ) : (
          notes.slice(0, 4).map((item) => (
            <article key={item.id} className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/70">
              <p className="text-sm leading-6 text-gray-700 dark:text-gray-300">{item.note}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500">
                {formatDateTimeLabel(item.createdAt)}
              </p>
            </article>
          ))
        )}
      </div>
    </Card>
  )
}
