const toneClasses = {
  danger: 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/70 dark:bg-red-950/35 dark:text-red-300',
  warning: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/35 dark:text-amber-300',
  info: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/70 dark:bg-blue-950/35 dark:text-blue-300',
}

export default function AlertCard({ title, message, tone = 'info' }) {
  return (
    <article className={['rounded-xl border p-4', toneClasses[tone]].join(' ')}>
      <p className="text-sm font-bold uppercase tracking-[0.18em]">{title}</p>
      <p className="mt-2 text-sm leading-6">{message}</p>
    </article>
  )
}
