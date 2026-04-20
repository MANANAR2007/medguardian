import Card from './Card'

export default function StatCard({ label, value, helper, tone = 'default', loading = false }) {
  const toneClasses = {
    default: 'text-gray-900 dark:text-gray-100',
    danger: 'text-red-500',
    warning: 'text-amber-500',
    success: 'text-green-500',
  }

  const accentClasses = {
    default: 'bg-gray-300 dark:bg-gray-700',
    danger: 'bg-red-500',
    warning: 'bg-amber-500',
    success: 'bg-green-500',
  }

  return (
    <Card as="article" interactive className="relative overflow-hidden p-4">
      <span className={['absolute left-0 top-0 h-full w-1', accentClasses[tone]].join(' ')} />
      <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">{label}</p>
      {loading ? (
        <div className="mt-4 h-9 w-24 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
      ) : (
        <p className={['mt-3 text-3xl font-extrabold tracking-tight', toneClasses[tone]].join(' ')}>
          {value}
        </p>
      )}
      {helper ? <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">{helper}</p> : null}
    </Card>
  )
}
