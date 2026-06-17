interface Props {
  type?: 'job' | 'freelance' | 'microtask'
  size?: 'sm' | 'md' | 'lg'
}

const badges = {
  job: { label: 'Работа', class: 'bg-blue-500/20 text-blue-400' },
  freelance: { label: 'Фриланс', class: 'bg-green-500/20 text-green-400' },
  microtask: { label: 'Микрозадача', class: 'bg-purple-500/20 text-purple-400' },
}

export default function ProjectTypeBadge({ type = 'freelance', size = 'sm' }: Props) {
  const badge = badges[type]
  if (!badge) return null

  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'

  return (
    <span className={`rounded-full font-medium ${sizeClass} ${badge.class}`}>
      {badge.label}
    </span>
  )
}
