import { useRef, useState } from 'react'
import { scanPrescription } from '../services/gemini'
import Button from './Button'
import Card from './Card'
import InputField from './InputField'
import SectionHeader from './SectionHeader'
import Skeleton from './Skeleton'

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

function toMedicationDraft(medication) {
  return {
    name: medication.name || '',
    dosage: medication.dosage || '',
    frequency: medication.frequency?.toLowerCase().includes('weekly') ? 'weekly' : 'daily',
    times: ['08:00'],
  }
}

function normalizeExtractedMedication(medication) {
  return {
    name: medication.name || '',
    dosage: medication.dosage || '',
    frequency: medication.frequency || '',
  }
}

export default function PrescriptionScanner({ onMedicationExtracted }) {
  const inputRef = useRef(null)
  const [extractedMedications, setExtractedMedications] = useState([])
  const [errorMessage, setErrorMessage] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [isScanning, setIsScanning] = useState(false)

  async function scanFile(file) {
    if (!file || isScanning) {
      return
    }

    setIsScanning(true)
    setErrorMessage('')
    setExtractedMedications([])

    try {
      const data = await readFileAsBase64(file)
      const medications = await scanPrescription({
        data,
        mimeType: file.type || 'image/jpeg',
      })

      if (medications.length === 0) {
        setErrorMessage('AI failed, try again')
        return
      }

      const normalizedMedications = medications.map(normalizeExtractedMedication)
      setExtractedMedications(normalizedMedications)

      if (normalizedMedications[0]) {
        onMedicationExtracted(toMedicationDraft(normalizedMedications[0]))
      }
    } catch (error) {
      setErrorMessage(error.message || 'AI failed, try again')
    } finally {
      setIsScanning(false)
      setIsDragging(false)
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }

  function handleFileChange(event) {
    scanFile(event.target.files?.[0])
  }

  function handleDrop(event) {
    event.preventDefault()
    scanFile(event.dataTransfer.files?.[0])
  }

  function updateExtractedMedication(index, field, value) {
    setExtractedMedications((current) =>
      current.map((medication, medicationIndex) =>
        medicationIndex === index ? { ...medication, [field]: value } : medication,
      ),
    )
  }

  return (
    <Card>
      <SectionHeader
        eyebrow="Scanner"
        title="Extract prescription details"
        description="Drop a prescription image here. Gemini extracts medication names, dosages, and frequencies, then lets you review before filling the form."
        compact
      />

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
        onDrop={handleDrop}
      >
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-white text-sm font-extrabold text-blue-500 shadow-sm dark:bg-gray-900 dark:text-blue-300">
          Rx
        </span>
        <span className="mt-4 text-sm font-bold text-gray-900 dark:text-gray-100">
          {isScanning ? 'Scanning...' : 'Drop prescription here or browse'}
        </span>
        <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">PNG, JPG, or WEBP</span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isScanning}
          className="sr-only"
        />
      </label>

      {isScanning ? (
        <div className="mt-4 grid gap-3">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : null}

      {errorMessage ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/70 dark:bg-red-950/35 dark:text-red-300">
          {errorMessage}
        </div>
      ) : null}

      {extractedMedications.length > 0 ? (
        <div className="mt-4 space-y-3">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Review extracted medications</p>
          {extractedMedications.map((medication, index) => (
            <article
              key={`${medication.name}-${index}`}
              className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/70"
            >
              <div className="grid gap-3 md:grid-cols-3">
                <InputField
                  id={`scan-name-${index}`}
                  label="Name"
                  value={medication.name}
                  onChange={(event) => updateExtractedMedication(index, 'name', event.target.value)}
                />
                <InputField
                  id={`scan-dosage-${index}`}
                  label="Dosage"
                  value={medication.dosage}
                  onChange={(event) => updateExtractedMedication(index, 'dosage', event.target.value)}
                />
                <InputField
                  id={`scan-frequency-${index}`}
                  label="Frequency"
                  value={medication.frequency}
                  onChange={(event) => updateExtractedMedication(index, 'frequency', event.target.value)}
                />
              </div>
              <div className="mt-3 flex justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => onMedicationExtracted(toMedicationDraft(medication))}
                >
                  Use in form
                </Button>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </Card>
  )
}
