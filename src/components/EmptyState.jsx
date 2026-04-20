export default function EmptyState({ title, description, action, label = 'Empty state' }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:bg-blue-950/50 dark:text-blue-300">
        {label}
      </span>
      <h2 className="mt-4 text-xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 dark:text-gray-400">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
