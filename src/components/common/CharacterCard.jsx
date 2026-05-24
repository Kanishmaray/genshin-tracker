import React, { useState } from 'react'
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
  const { buildProgress, checklists } = useGameData()

  const score = Math.round(buildProgress ? buildProgress(char.id) : 0)
  const checklist = (checklists && checklists[char.id]) || {}
  const elemColor = ELEMENT_COLORS[char.element] || '#888'
  const rarityColor = RARITY_COLORS[char.rarity] || '#888'

  const pieceDone = PIECE_KEYS.filter(k => checklist[k]).length
  const weaponLabel = FACTION_LABELS[checklist.weapon_tier] || '—'

  return (
    <div
      style={{ perspective: '900px', height: 240, cursor: 'pointer', borderRadius: 16 }}
      onClick={() => navigate('/character/' + char.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── flip inner ── */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.55s cubic-bezier(0.23,1,0.32,1)',
          transform: hovered ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* ══ FRONT FACE ══ */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 16,
            overflow: 'hidden',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            boxShadow: `0 4px 24px ${elemColor}33`,
            border: `1.5px solid ${elemColor}33`,
          }}
        >
          {char.image ? (
            <img
              src={char.image}
              alt={char.name}
              style={{
                width: '100%', height: '100%',
                objectFit: 'cover', objectPosition: 'top center',
                display: 'block',
              }}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              background: `linear-gradient(135deg, ${elemColor}33 0%, #1a1a2e 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 48,
            }}>
              ✦
            </div>
          )}

          {/* gradient scrim */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)',
          }} />

          {/* rarity dots */}
          <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 3 }}>
            {Array(char.rarity || 4).fill(0).map((_, i) => (
              <div key={i} style={{
                width: 6, height: 6, borderRadius: '50%',
                background: rarityColor, boxShadow: `0 0 4px ${rarityColor}`,
              }} />
            ))}
          </div>

          {/* priority badge */}
          {char.priority && (
            <div style={{
              position: 'absolute', top: 10, right: 10,
              fontSize: 9, fontWeight: 700, padding: '2px 6px',
              borderRadius: 4, letterSpacing: '0.08em',
              background: char.priority === 'High' ? '#ef4444cc'
                        : char.priority === 'Medium' ? '#f59e0bcc' : '#6b7280cc',
              color: '#fff',
            }}>
              {char.priority}
            </div>
          )}

          {/* name + element */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 12px 13px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '0.02em', textShadow: '0 1px 4px #000a' }}>
                {char.name}
              </span>
              <span style={{
                fontSize: 8, fontWeight: 700, padding: '1px 5px', borderRadius: 4,
                background: `${elemColor}22`, color: elemColor, border: `1px solid ${elemColor}44`,
                letterSpacing: '0.1em', backdropFilter: 'blur(4px)',
              }}>
                {char.element?.toUpperCase()}
              </span>
            </div>
            <div style={{ fontSize: 10, color: 'rgba(160,163,176,0.75)' }}>
              {char.weapon} · {char.role}
            </div>
          </div>
        </div>

        {/* ══ BACK FACE ══ */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 16,
            overflow: 'hidden',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: `linear-gradient(135deg, #1a1a2e 0%, ${elemColor}18 100%)`,
            border: `1.5px solid ${elemColor}55`,
            boxShadow: `0 4px 24px ${elemColor}44`,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '14px 12px', gap: 10,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: '0.04em', textAlign: 'center' }}>
            {char.name}
          </div>

          <ProgressRing progress={score} size={72} strokeWidth={5} color={elemColor} />

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
            {PIECE_KEYS.map(k => (
              <span key={k} title={k} style={{
                fontSize: 16,
                opacity: checklist[k] ? 1 : 0.2,
                filter: checklist[k] ? `drop-shadow(0 0 4px ${elemColor})` : 'none',
                transition: 'opacity 0.2s',
              }}>
                {PIECE_ICONS[k]}
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 6,
              background: `${elemColor}22`, color: elemColor, border: `1px solid ${elemColor}44`,
              letterSpacing: '0.08em',
            }}>
              {weaponLabel} weapon
            </span>
            <span style={{ fontSize: 10, color: 'rgba(200,200,210,0.7)' }}>
              {pieceDone}/5 pieces
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
