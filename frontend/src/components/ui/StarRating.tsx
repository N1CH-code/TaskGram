interface Props {
  rating: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onChange?: (rating: number) => void
}

export default function StarRating({ rating, size = 'md', interactive = false, onChange }: Props) {
  const sizeClass = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-2xl' : 'text-lg'

  return (
    <div className={`star-rating ${sizeClass}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${interactive ? 'cursor-pointer' : ''}`}
          style={{ color: star <= rating ? '#FACC15' : '#2A2A30' }}
          onClick={() => interactive && onChange?.(star)}
        >
          ★
        </span>
      ))}
    </div>
  )
}
