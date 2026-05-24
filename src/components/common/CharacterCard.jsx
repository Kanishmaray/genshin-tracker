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
const FACTION_LABELS = { bis: 'BiS', bp: 'BP', f2p: 'F2P', good: 'Good', skip: 'Skip', none: '—' }

export default function CharacterCard({ char }) {
  const navigate = useNavigate()
  const [flipped, setFlipped] = useState(false)
  const [flipDone, setFlipDone] = useState(false)
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, lx: 50, ly: 50 })
  const outerRef = useRef(null)
  const flipTimerRef = useRef(null)
  const { buildProgress, checklists } = useGameData()

  const score = Math.round(buildProgress ? buildProgress(char.id) : 0)
  const checklist = (checklists && checklists[char.id]) || {}
  const elemColor = ELEMENT_COLORS[char.element] || '#888'
  const rarityColor = RARITY_COLORS[char.rarity] || '#888'
  const pieceDone = PIECE_KEYS.filter(k => checklist[k]).length
  const weaponLabel = FACTION_LABELS[checklist.weapon_tier] || '—'

  const handleMouseEnter = useCallback(() => {
    setFlipped(true)
    flipTimerRef.current = setTimeout(() => setFlipDone(true), 520)
  }, [])

  const handleMouseLeave = useCallback(() => {
    clearTimeout(flipTimerRef.current)
    setFlipped(false)
    setFlipDone(false)
    setTilt({ rx: 0, ry: 0, lx: 50, ly: 50 })
  }, [])

  const handleMouseMove = useCallback((e) => {
    if (!flipDone || !outerRef.current) return
    const rect = outerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const rx = ((y - rect.height / 2) / (rect.height / 2)) * -10
    const ry = ((x - rect.width / 2) / (rect.width / 2)) * 10
    setTilt({ rx, ry, lx: (x / rect.width) * 100, ly: (y / rect.height) * 100 })
  }, [flipDone])

  return (
    <div
      ref={outerRef}
      style={{
        height: 240,
        cursor: 'pointer',
        borderRadius: 16,
        perspective: '900px',
        boxShadow: flipped
          ? `0 8px 32px ${elemColor}55, 0 2px 8px rgba(0,0,0,0.5)`
          : `0 4px 16px ${elemColor}22, 0 2px 4px rgba(0,0,0,0.3)`,
        transition: 'box-shadow 0.3s ease',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onClick={() => navigate('/character/' + char.id)}
    >
      {/* Tilt layer — activates after flip settles */}
      <div style={{
        width: '100%',
        height: '100%',
        transformStyle: 'preserve-3d',
        transform: flipDone
          ? `rotateX(${tilt.rx}deg) rotateY(${-tilt.ry}deg) scale(1.04)`
          : flipped ? 'scale(1.01)' : 'scale(1)',
        transition: flipDone
          ? 'transform 0.08s ease-out'
          : 'transform 0.4s ease-out',
      }}>
        {/* Flip layer */}
        <div style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: 'transform 0.5s ease-in-out',
          borderRadius: 16,
        }}>

          {/* ── FRONT FACE ── */}
          <div style={{
            position: 'absolute', inset: 0,
            backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
            borderRadius: 16, overflow: 'hidden',
            border: `1.5px solid ${elemColor}44`,
          }}>
            {char.image ? (
              <img src={char.image} alt={char.name} style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                objectFit: 'cover', objectPosition: 'top center',
              }} />
            ) : (
              <div style={{
                position: 'absolute', inset: 0,
                background: `linear-gradient(135deg, ${elemColor}33, ${rarityColor}33)`,
              }} />
            )}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)',
            }} />
            <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 3 }}>
              {Array.from({ length: char.rarity || 4 }).map((_, i) => (
                <div key={i} style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: rarityColor, boxShadow: `0 0 4px ${rarityColor}`,
                }} />
              ))}
            </div>
            <div style={{ position: 'absolute', bottom: 10, left: 10, right: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <span style={{
                  fontSize: 14, fontWeight: 700, color: '#fff',
                  letterSpacing: '0.02em', textShadow: '0 1px 4px #000a',
                }}>{char.name}</span>
                <span style={{
                  fontSize: 8, fontWeight: 700, padding: '1px 5px', borderRadius: 4,
                  background: `${elemColor}22`, color: elemColor,
                  border: `1px solid ${elemColor}44`,
                  letterSpacing: '0.1em', backdropFilter: 'blur(4px)',
                }}>{char.element?.toUpperCase()}</span>
              </div>
              <div style={{ fontSize: 10, color: 'rgba(160,163,176,0.75)' }}>
                {char.weapon} · {char.role}
              </div>
            </div>
          </div>

          {/* ── BACK FACE ── */}
          <div style={{
            position: 'absolute', inset: 0,
            backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            borderRadius: 16, overflow: 'hidden',
            border: `1.5px solid ${elemColor}66`,
            background: `linear-gradient(160deg, rgba(8,8,20,0.97) 0%, ${elemColor}30 100%)`,
            display: 'flex', flexDirection: 'column',
            padding: '12px 14px', gap: 7,
          }}>
            {/* Name + element */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{char.name}</span>
              <span style={{
                fontSize: 8, fontWeight: 700, padding: '1px 5px', borderRadius: 4,
                background: `${elemColor}22`, color: elemColor,
                border: `1px solid ${elemColor}44`, letterSpacing: '0.1em',
              }}>{char.element?.toUpperCase()}</span>
            </div>

            {/* Score ring — own row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <ProgressRing progress={score} size={44} color={elemColor} />
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>Build Score</div>
            </div>

            {/* Artifact pieces — full-width row so all 5 fit */}
            <div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginBottom: 4 }}>Artifacts</div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {PIECE_KEYS.map(k => (
                  <span key={k} style={{
                    fontSize: 18,
                    opacity: checklist[k] ? 1 : 0.2,
                    filter: checklist[k] ? 'none' : 'grayscale(1)',
                  }}>{PIECE_ICONS[k]}</span>
                ))}
              </div>
            </div>

            {/* Weapon tier */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: '5px 8px',
            }}>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>Weapon</span>
              <span style={{
                fontSize: 11, fontWeight: 700,
                color: checklist.weapon_tier === 'bis' ? '#fbbf24' : elemColor,
              }}>{weaponLabel}</span>
            </div>

            {/* Pieces done */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: '5px 8px',
            }}>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>Pieces</span>
              <span style={{
                fontSize: 11, fontWeight: 700,
                color: pieceDone === 5 ? '#86efac' : elemColor,
              }}>{pieceDone}/5</span>
            </div>

            {/* Holographic sheen — only after flip settles */}
            {flipDone && (
              <div style={{
                position: 'absolute', inset: 0, borderRadius: 16,
                pointerEvents: 'none',
                background: `radial-gradient(circle at ${tilt.lx}% ${tilt.ly}%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.06) 35%, transparent 65%)`,
                mixBlendMode: 'overlay',
              }} />
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
