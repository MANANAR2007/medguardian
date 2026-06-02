import { useState } from 'react'
import Card from './Card'
import SectionHeader from './SectionHeader'

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      const result = String(reader.result || '')
      resolve(result.includes(',') ? result.split(',')[1] : result)
    }

    reader.onerror = () => reject(new Error('Unable to read this file.'))
    reader.readAsDataURL(file)
  })
}

const categoryOptions = [
  { value: 'lab-report', label: 'Lab report' },
  { value: 'prescription', label: 'Prescription' },
  { value: 'doctor-note', label: 'Doctor note' },
  { value: 'general-report', label: 'Medical report' },
]

export default function ReportUploader({ activeFamilyMember, onUpload }) {
  const [category, setCategory] = useState('lab-report')
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function processFile(file) {
    if (!file || !activeFamilyMember) {
      return
    }

    setIsUploading(true)
    setErrorMessage('')

    try {
      const fileData = await readFileAsBase64(file)

      await onUpload({
        familyMemberId: activeFamilyMember.id,
        familyMemberName: activeFamilyMember.name,
        category,
        file: {
          name: file.name,
          mimeType: file.type || 'application/octet-stream',
          data: fileData,
        },
      })
    } catch (error) {
      setErrorMessage(error.message || 'Unable to analyze this report.')
    } finally {
      setIsUploading(false)
      setIsDragging(false)
    }
  }

  return (
    <Card>
      <SectionHeader
        eyebrow="Report vault"
        title="Upload a health document"
        description="Upload lab reports, prescriptions, report images, and doctor notes. AI extracts structured findings while preserving the original values."
        compact
      />

      <label className="mt-4 block">
        <span className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">Document type</span>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-950"
        >
          {categoryOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label
        className={[
          'mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-5 py-8 text-center transition duration-200',
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/30'
            : 'border-gray-300 bg-gray-50 hover:border-blue-500 hover:bg-blue-50 dark:border-gray-700 dark:bg-gray-800/70 dark:hover:border-blue-400 dark:hover:bg-blue-950/30',
        ].join(' ')}
        onDragEnter={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          processFile(event.dataTransfer.files?.[0])
        }}
      >
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-white text-sm font-extrabold text-blue-500 shadow-sm dark:bg-gray-900 dark:text-blue-300">
          AI
        </span>
        <span className="mt-4 text-sm font-bold text-gray-900 dark:text-gray-100">
          {isUploading ? 'Analyzing document...' : 'Drop report here or browse'}
        </span>
        <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">PDF, PNG, JPG, WEBP, or TXT</span>
        <input
          type="file"
          accept=".pdf,image/*,.txt"
          className="sr-only"
          disabled={!activeFamilyMember || isUploading}
          onChange={(event) => processFile(event.target.files?.[0])}
        />
      </label>

      {errorMessage ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/70 dark:bg-red-950/35 dark:text-red-300">
          {errorMessage}
        </div>
      ) : null}

      {!activeFamilyMember ? (
        <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800/70 dark:text-gray-400">
          Create or select a family member before uploading a report.
        </div>
      ) : null}

      {isUploading ? (
        <div className="mt-4 flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-100 border-t-blue-500 dark:border-gray-800 dark:border-t-blue-400" />
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Extracting test values, medications, and patient-friendly insights...
          </p>
        </div>
      ) : null}
    </Card>
  )
}
