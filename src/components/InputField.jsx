export default function InputField({ id, label, hint, className = '', ...props }) {
  return (
    <label className="block" htmlFor={id}>
      <span className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">{label}</span>
      <input
        id={id}
        className={[
          'h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400',
          'focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-950',
          className,
        ].join(' ')}
        {...props}
      />
      {hint ? <span className="mt-2 block text-xs text-gray-500 dark:text-gray-400">{hint}</span> : null}
    </label>
  )
}
