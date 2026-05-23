import React, { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameData } from '../../lib/useGameData'
import ProgressRing from './ProgressRing'

const ELEMENT_COLORS = {
  Geo: '#D4A017', Electro: '#A855F7', Anemo: '#2DD4BF',
  Hydro: '#38BDF8', Pyro: '#FB923C', Cryo: '#94A3B8', Dendro: '#4ADE80',
}
const PRIORITY_COLORS = { S: '#FFD700', A: '#C084FC', B: '#60A5FA', C: '#6B7280' }
const PIECE_ICONS = ['🌸', '🪶', '⏳', '🏺', '👑']
const PIECE_KEYS  = ['flower', 'feather', 'sands', 'goblet', 'circlet']
const WEAPON_LABELS = { bis: 'BiS', bp: 'BP', f2p: 'F2P', none: '—' }

export default function CharacterCard({ char }) {
  const navigate = useNavigate()
  const { buildProgress, checklists } = useGameData()

  const progress     = buildProgress(char.id)
  const cl           = checklists[char.id] || {}
  const elemColor    = ELEMENT_COLORS[char.element] || '#ffffff'
  const priorityColor = PRIORITY_COLORS[char.priority]
  const equippedCount = PIECE_KEYS.filter(p => cl[p]).length
  const weaponLabel  = WEAPON_LABELS[cl.weapon_tier || 'none']

  // ── 3-D tilt state ──────────────────────────────────────────────────────────
  const cardRef  = useRef(null)
  const [hovered, setHovered] = useState(false)
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, lx: 50, ly: 50 })

  const handleMouseMove = useCallback((e) => {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    const cx = (e.clientX - rect.left) / rect.width   // 0→1
    const cy = (e.clientY - rect.top)  / rect.height  // 0→1
    setTilt({
      rx:  (cy - 0.5) * -22,   // tilt up/down  ±11°
      ry:  (cx - 0.5) *  22,   // tilt left/right ±11°
      lx:  cx * 100,
      ly:  cy * 100,
    })
  }, [])

  const handleMouseEnter = () => setHovered(true)
  const handleMouseLeave = () => {
    setHovered(false)
    setTilt({ rx: 0, ry: 0, lx: 50, ly: 50 })
  }

  // Glow shifts with light position (offset from center in px)
  const glowX = ((tilt.lx - 50) / 50) * 10
  const glowY = ((tilt.ly - 50) / 50) * 10

  return (
    <div
      ref={cardRef}
      style={{
        cursor: 'pointer',
        height: 240,
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
        // 3-D tilt + scale
        transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(${hovered ? 1.04 : 1})`,
        transition: hovered
          ? 'transform 0.08s linear, box-shadow 0.12s ease'
          : 'transform 0.55s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.4s ease',
        border: `1px solid ${elemColor}${hovered ? '66' : '33'}`,
        boxShadow: hovered
          ? `${glowX}px ${glowY}px 32px ${elemColor}44, 0 8px 32px rgba(0,0,0,0.6)`
          : `0 4px 20px rgba(0,0,0,0.45)`,
        willChange: 'transform',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => navigate(`/character/${char.id}`)}
    >
      {/* ── Portrait or fallback ── */}
      {char.image ? (
        <img
          src={char.image}
          alt={char.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block' }}
        />
      ) : (
        <div style={{
          width: '100%', height: '100%',
          background: `linear-gradient(155deg, ${char.colors.bgFrom} 0%, ${char.colors.bgVia} 55%, ${elemColor}28 100%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
        }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              position: 'absolute', right: -20 - i * 30, bottom: -20 - i * 30,
              width: 90 + i * 65, height: 90 + i * 65, borderRadius: '50%',
              border: `1px solid ${elemColor}`, opacity: 0.07 + i * 0.02,
            }} />
          ))}
          <span style={{
            fontSize: 88, fontWeight: 800, color: elemColor, opacity: 0.12,
            fontFamily: 'serif', userSelect: 'none', position: 'relative', zIndex: 1, lineHeight: 1,
          }}>
            {char.name[0]}
          </span>
        </div>
      )}

      {/* ── Holographic sheen overlay (tracks cursor) ── */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 16,
        background: `radial-gradient(circle at ${tilt.lx}% ${tilt.ly}%, rgba(255,255,255,${hovered ? 0.09 : 0}) 0%, transparent 65%)`,
        transition: hovered ? 'background 0.06s' : 'background 0.4s',
        pointerEvents: 'none',
      }} />

      {/* ── Bottom gradient scrim ── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '62%',
        background: 'linear-gradient(to top, rgba(4,4,8,0.96) 0%, rgba(4,4,8,0.52) 55%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      {/* ── Priority badge — top right ── */}
      <div style={{
        position: 'absolute', top: 10, right: 10,
        width: 26, height: 26, borderRadius: '50%',
        background: `${priorityColor}20`, border: `1.5px solid ${priorityColor}99`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 10, fontWeight: 700, color: priorityColor,
        backdropFilter: 'blur(6px)',
      }}>
        {char.priority}
      </div>

      {/* ── Rarity dots — top left ── */}
      <div style={{ position: 'absolute', top: 12, left: 10, display: 'flex', gap: 2.5 }}>
        {Array(char.rarity).fill(0).map((_, i) => (
          <div key={i} style={{
            width: 5, height: 5, borderRadius: '50%',
            background: char.rarity === 5 ? '#FFD700' : '#C084FC',
            boxShadow: `0 0 5px ${char.rarity === 5 ? '#FFD700' : '#C084FC'}`,
            opacity: 0.9,
          }} />
        ))}
      </div>

      {/* ── Default name / element / progress info ── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '10px 12px 13px',
        transition: 'opacity 0.25s',
        opacity: hovered ? 0 : 1,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '0.02em' }}>{char.name}</span>
          <span style={{
            fontSize: 8, fontWeight: 700, padding: '1px 6px', borderRadius: 4,
            background: `${elemColor}22`, color: elemColor, border: `1px solid ${elemColor}44`,
            letterSpacing: '0.1em', backdropFilter: 'blur(4px)',
          }}>
            {char.element.toUpperCase()}
          </span>
        </div>
        <div style={{ fontSize: 10, color: 'rgba(160,163,176,0.75)', marginBottom: 7 }}>
          {char.weapon} · {char.role}
        </div>
        <div style={{ height: 2, borderRadius: 2, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${progress}%`, borderRadius: 2,
            background: `linear-gradient(90deg, ${elemColor}88, ${elemColor})`,
          }} />
        </div>
        <div style={{ fontSize: 9, color: 'rgba(160,163,176,0.45)', marginTop: 3 }}>{progress}% built</div>
      </div>

      {/* ── Hover overlay — build details ── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '14px 14px 16px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9,
        transition: 'opacity 0.25s',
        opacity: hovered ? 1 : 0,
        pointerEvents: 'none',
      }}>
        {/* Progress ring */}
        <ProgressRing progress={progress} color={elemColor} size={54} strokeWidth={4} showText />

        {/* Artifact pieces */}
        <div style={{ display: 'flex', gap: 5 }}>
          {PIECE_KEYS.map((p, i) => (
            <div key={p} style={{
              width: 26, height: 26, borderRadius: 7,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13,
              background: cl[p] ? `${elemColor}28` : 'rgba(255,255,255,0.04)',
              border: cl[p] ? `1px solid ${elemColor}66` : '1px solid rgba(255,255,255,0.08)',
              boxShadow: cl[p] ? `0 0 8px ${elemColor}22` : 'none',
              opacity: cl[p] ? 1 : 0.3,
            }}>
              {PIECE_ICONS[i]}
            </div>
          ))}
        </div>

        {/* Weapon + pieces text */}
        <div style={{ display: 'flex', gap: 10, fontSize: 10, color: '#6B7280' }}>
          <span>Weapon: <span style={{ color: elemColor, fontWeight: 600 }}>{weaponLabel}</span></span>
          <span style={{ color: 'rgba(255,255,255,0.12)' }}>·</span>
          <span>Pieces: <span style={{ color: elemColor, fontWeight: 600 }}>{equippedCount}/5</span></span>
        </div>
      </div>
    </div>
  )
}
