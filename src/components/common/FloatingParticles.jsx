import React, { useMemo } from 'react'

export default function FloatingParticles({ color = '#ffffff', count = 12, className = '' }) {
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      size: Math.random() * 4 + 2,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: Math.random() * 4 + 4,
      delay: Math.random() * 4,
      isDiamond: Math.random() > 0.6,
    }))
  }, [count])

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            backgroundColor: color,
            borderRadius: p.isDiamond ? '0' : '50%',
            transform: p.isDiamond ? 'rotate(45deg)' : 'none',
            opacity: 0,
            animation: `sparkle ${p.duration}s ease-in-out ${p.delay}s infinite`,
            boxShadow: `0 0 ${p.size * 2}px ${color}`,
          }}
        />
      ))}
    </div>
  )
}
