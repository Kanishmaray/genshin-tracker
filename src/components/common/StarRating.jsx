import React from 'react'

const STAR_COLORS = {
  5: '#FFD700',
  4: '#C084FC',
}

export default function StarRating({ count = 5, size = 'md' }) {
  const starColor = STAR_COLORS[count] || '#FFD700'
  const sizePx = size === 'sm' ? 10 : 14

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg
          key={i}
          width={sizePx}
          height={sizePx}
          viewBox="0 0 24 24"
          fill={starColor}
          style={{ filter: `drop-shadow(0 0 3px ${starColor}88)` }}
        >
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ))}
    </div>
  )
}
