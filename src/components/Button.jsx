export default function Button({
  type = 'button',
  children,
  fullWidth = false,
  disabled = false,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
}) {
  const variantClasses = {
    primary: 'bg-blue-500 text-white shadow-sm shadow-blue-500/20 hover:bg-blue-600 disabled:bg-gray-300 disabled:text-gray-500 dark:disabled:bg-gray-700 dark:disabled:text-gray-400',
    secondary: 'border border-gray-200 bg-white text-gray-700 shadow-sm hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 disabled:bg-gray-100 disabled:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-100 dark:disabled:bg-gray-800 dark:disabled:text-gray-500',
    success: 'bg-green-500 text-white shadow-sm shadow-green-500/20 hover:bg-green-600 disabled:bg-green-200 disabled:text-green-700 dark:disabled:bg-green-950 dark:disabled:text-green-500',
    warning: 'bg-amber-500 text-white shadow-sm shadow-amber-500/20 hover:bg-amber-600 disabled:bg-amber-200 disabled:text-amber-700 dark:disabled:bg-amber-950 dark:disabled:text-amber-500',
    danger: 'bg-red-500 text-white shadow-sm shadow-red-500/20 hover:bg-red-600 disabled:bg-red-200 disabled:text-red-700 dark:disabled:bg-red-950 dark:disabled:text-red-500',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:text-gray-400 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100 dark:disabled:text-gray-600',
  }

  const sizeClasses = {
    sm: 'h-9 px-3 text-xs',
    md: 'h-11 px-4 text-sm',
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={[
        'inline-flex items-center justify-center rounded-xl font-semibold transition duration-200 disabled:cursor-not-allowed',
        'focus:outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-950',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
    >
      {children}
    </button>
  )
}
