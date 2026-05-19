import React from 'react'

const ELEMENT_CONFIG = {
  Geo: { color: '#D4A017', bg: '#2a1e00', icon: '⬡' },
  Electro: { color: '#A855F7', bg: '#1a0630', icon: '⚡' },
  Anemo: { color: '#2DD4BF', bg: '#00201e', icon: '◎' },
  Hydro: { color: '#38BDF8', bg: '#001a2e', icon: '◈' },
  Pyro: { color: '#FB923C', bg: '#2a0e00', icon: '✦' },
  Cryo: { color: '#94A3B8', bg: '#0a0e14', icon: '❄' },
  Dendro: { color: '#4ADE80', bg: '#002010', icon: '✿' },
}

export default function ElementBadge({ element, small = false }) {
  const config = ELEMENT_CONFIG[element] || { color: '#ffffff', bg: '#111', icon: '?' }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${small ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}
      style={{
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.color}44`,
        boxShadow: `0 0 8px ${config.color}22`,
      }}
    >
      <span style={{ fontSize: small ? 9 : 11 }}>{config.icon}</span>
      {element}
    </span>
  )
}
