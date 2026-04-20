export default function Card({ as: Element = 'section', children, className = '', interactive = false, ...props }) {
  return (
    <Element
      className={[
        'rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900',
        interactive ? 'transition duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md dark:hover:border-gray-600' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </Element>
  )
}
