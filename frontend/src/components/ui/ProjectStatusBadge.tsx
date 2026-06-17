interface Props {
  status: string
}

const labels: Record<string, string> = {
  NEW: 'Новый',
  DISCUSSION: 'Обсуждение',
  IN_PROGRESS: 'В работе',
  REVIEW: 'На проверке',
  COMPLETED: 'Завершён',
  CANCELLED: 'Отменён',
}

export default function ProjectStatusBadge({ status }: Props) {
  const label = labels[status] || status
  const className = `status-${status.toLowerCase()}`

  return (
    <span className={`px-3 py-1 rounded-lg text-sm font-medium ${className}`}>
      {label}
    </span>
  )
}
