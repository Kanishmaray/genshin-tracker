import React, { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameData } from '../../lib/useGameData'
import ProgressRing from './ProgressRing'

const ELEMENT_COLORS = {
  Pyro: '#FF6B35', Hydro: '#4FC3F7', Anemo: '#2DD4BF',
  Electro: '#C084FC', Cryo: '#94A3B8', Geo: '#FBBF24', Dendro: '#86EFAC',
}

const RARITY_COLORS = { 5: '#C0713A', 4: '#8B6FA8' }

const PIECE_ICONS = { flower: '🌸', feather: '🪶', sands: '⏳', goblet: '🏆', circlet: '👑' }
const PIECE_KEYS = ['flower', 'feather', 'sands', 'goblet', 'circlet']

const FACTION_LABELS = {
  bis: 'BiS', bp: 'BP', f2p: 'F2P', good: 'Good', skip: 'Skip', none: '—',
}

export default function CharacterCard({ char }) {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(false)
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, lx: 50, ly: 50 })
  const cardRef = useRef(null)
  const { buildProgress, checklists } = useGameData()

  const score = Math.round(buildProgress ? buildProgress(char.id) : 0)
  const checklist = (checklists && checklists[char.id]) || {}
  const elemColor = ELEMENT_COLORS[char.element] || '#888'
  const rarityColor = RARITY_COLORS[char.rarity] || '#888'
  const pieceDone = PIECE_KEYS.filter(k => checklist[k]).length
  const weaponLabel = FACTION_LABELS[checklist.weapon_tier] || '—'

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const rx = ((y - rect.height / 2) / (rect.height / 2)) * -10
    const ry = ((x - rect.width / 2) / (rect.width / 2)) * 10
    setTilt({ rx, ry, lx: (x / rect.width) * 100, ly: (y / rect.height) * 100 })
  }, [])

  const handleMouseLeave = useCallback(() => {
    setHovered(false)
    setTilt({ rx: 0, ry: 0, lx: 50, ly: 50 })
  }, [])

  return (
    <div
      ref={cardRef}
      style={{
        position: 'relative',
        height: 240,
        cursor: 'pointer',
        borderRadius: 16,
        overflow: 'hidden',
        border: `1.5px solid ${elemColor}44`,
        boxShadow: hovered
          ? `0 8px 32px ${elemColor}55, 0 2px 8px rgba(0,0,0,0.5)`
          : `0 4px 16px ${elemColor}22, 0 2px 4px rgba(0,0,0,0.3)`,
        transform: hovered
          ? `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(1.04)`
          : 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)',
        transition: hovered
          ? 'transform 0.08s ease-out, box-shadow 0.15s ease-out'
          : 'transform 0.45s ease-out, box-shadow 0.3s ease-out',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={() => navigate('/character/' + char.id)}
    >
      {/* Character image */}
      {char.image ? (
        <img
          src={char.image}
          alt={char.name}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'top center',
          }}
        />
      ) : (
        <div style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(135deg, ${elemColor}33 0%, #1a1a2e 100%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 48, color: elemColor,
        }}>✦</div>
      )}

      {/* Back panel — fades in on hover, dark bg covers the image */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(160deg, rgba(8,8,20,0.97) 0%, ${elemColor}30 100%)`,
        opacity: hovered ? 1 : 0,
        transition: 'opacity 0.25s ease',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 10, padding: '14px 12px',
        pointerEvents: 'none',
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: '0.04em' }}>
          {char.name}
        </div>
        <ProgressRing progress={score} size={72} strokeWidth={5} color={elemColor} />
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
          {PIECE_KEYS.map(k => (
            <span key={k} style={{
              fontSize: 16,
              opacity: checklist[k] ? 1 : 0.2,
              filter: checklist[k] ? `drop-shadow(0 0 5px ${elemColor})` : 'none',
            }}>
              {PIECE_ICONS[k]}
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 6,
            background: `${elemColor}22`, color: elemColor, border: `1px solid ${elemColor}55`,
            letterSpacing: '0.08em',
          }}>{weaponLabel} weapon</span>
          <span style={{ fontSize: 10, color: 'rgba(200,200,210,0.7)' }}>{pieceDone}/5 pieces</span>
        </div>
      </div>

      {/* Bottom gradient scrim — fades out on hover */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.2) 55%, transparent 100%)',
        opacity: hovered ? 0 : 1,
        transition: 'opacity 0.25s ease',
        pointerEvents: 'none',
      }} />

      {/* Rarity dots */}
      <div style={{
        position: 'absolute', top: 10, left: 10, display: 'flex', gap: 3,
        opacity: hovered ? 0 : 1, transition: 'opacity 0.2s ease',
      }}>
        {Array(char.rarity || 4).fill(0).map((_, i) => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: '50%',
            background: rarityColor, boxShadow: `0 0 4px ${rarityColor}`,
          }} />
        ))}
      </div>

      {/* Priority badge */}
      {char.priority && (
        <div style={{
          position: 'absolute', top: 10, right: 10,
          fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
          background: char.priority === 'High' ? '#ef4444cc'
                    : char.priority === 'Medium' ? '#f59e0bcc' : '#6b7280cc',
          color: '#fff', letterSpacing: '0.08em',
          opacity: hovered ? 0 : 1, transition: 'opacity 0.2s ease',
        }}>{char.priority}</div>
      )}

      {/* Name + element — fades out on hover */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 12px 13px',
        opacity: hovered ? 0 : 1, transition: 'opacity 0.22s ease',
        pointerEvents: 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '0.02em', textShadow: '0 1px 4px #000a' }}>
            {char.name}
          </span>
          <span style={{
            fontSize: 8, fontWeight: 700, padding: '1px 5px', borderRadius: 4,
            background: `${elemColor}22`, color: elemColor, border: `1px solid ${elemColor}44`,
            letterSpacing: '0.1em', backdropFilter: 'blur(4px)',
          }}>{char.element?.toUpperCase()}</span>
        </div>
        <div style={{ fontSize: 10, color: 'rgba(160,163,176,0.75)' }}>
          {char.weapon} · {char.role}
        </div>
      </div>

      {/* Holographic sheen — follows cursor, visible on hover */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 16, pointerEvents: 'none',
        background: `radial-gradient(circle at ${tilt.lx}% ${tilt.ly}%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.06) 35%, transparent 65%)`,
        opacity: hovered ? 1 : 0,
        transition: 'opacity 0.3s ease',
        mixBlendMode: 'overlay',
      }} />
    </div>
  )
}
