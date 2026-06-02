import Button from './Button'
import Card from './Card'

export default function TestExplanationModal({ explanation, onClose }) {
  if (!explanation) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/50 px-4 py-6 backdrop-blur-sm">
      <Card className="w-full max-w-2xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-500 dark:text-blue-300">
              Explain my report
            </p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
              {explanation.testName}
            </h2>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <section className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/70">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Your value</p>
            <p className="mt-2 text-lg font-bold text-gray-900 dark:text-gray-100">{explanation.userValue || '--'}</p>
          </section>

          <section className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/70">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Normal range</p>
            <p className="mt-2 text-lg font-bold text-gray-900 dark:text-gray-100">{explanation.normalRange || '--'}</p>
          </section>
        </div>

        <div className="mt-4 space-y-4">
          <section className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/70">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">What this test measures</p>
            <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">{explanation.whatItMeasures || '--'}</p>
          </section>

          <section className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/70">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Why it matters</p>
            <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">{explanation.whyItMatters || '--'}</p>
          </section>

          <section className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/70">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Interpretation</p>
            <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">{explanation.interpretation || '--'}</p>
          </section>
        </div>
      </Card>
    </div>
  )
}
