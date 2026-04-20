export default function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  className = '',
  compact = false,
}) {
  return (
    <div className={['flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between', className].join(' ')}>
      <div className={compact ? 'max-w-2xl' : 'max-w-3xl'}>
        {eyebrow ? (
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-500 dark:text-blue-400">
            {eyebrow}
          </p>
        ) : null}
        <h1
          className={[
            'font-extrabold tracking-tight text-gray-900 dark:text-gray-100',
            compact ? 'mt-1 text-xl' : 'mt-2 text-3xl sm:text-4xl',
          ].join(' ')}
        >
          {title}
        </h1>
        {description ? (
          <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
