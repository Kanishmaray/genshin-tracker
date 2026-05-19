import React from 'react'
import { motion } from 'framer-motion'

export default function GlowCard({
  color = '#ffffff',
  children,
  className = '',
  onClick,
  hoverable = false,
}) {
  const Component = hoverable || onClick ? motion.div : 'div'
  const motionProps = hoverable || onClick
    ? { whileHover: { scale: 1.01 }, transition: { type: 'spring', stiffness: 300 } }
    : {}

  return (
    <Component
      {...motionProps}
      onClick={onClick}
      className={`glass-card ${className}`}
      style={{
        border: `1px solid ${color}22`,
        boxShadow: `0 4px 24px ${color}18, inset 0 1px 0 rgba(255,255,255,0.05)`,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {children}
    </Component>
  )
}
