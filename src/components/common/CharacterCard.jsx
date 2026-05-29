import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameData } from '../../lib/useGameData'
import ProgressRing from './ProgressRing'

const ELEMENT_COLORS = {
  Geo: '#D4A017', Electro: '#A855F7', Anemo: '#2DD4BF',
  Hydro: '#38BDF8', Pyro: '#FB923C', Cryo: '#94A3B8', Dendro: '#4ADE80',
}
const PRIORITY_COLORS = { S: '#FFD700', A: '#C084FC', B: '#60A5FA', C: '#6B7280' }
const PIECE_ICONS = ['🌸', '🪶', '⏳', '🏺', '👑']
const PIECE_KEYS = ['flower', 'feather', 'sands', 'goblet', 'circlet']
const WEAPON_LABELS = { bis: 'BiS', bp: 'BP', f2p: 'F2P', none: '—' }

// Detect touch-primary device once on load
const IS_TOUCH = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches

export default function CharacterCard({ char }) {
  const navigate = useNavigate()
  const { buildProgress, checklists } = useGameData()

  const progress = buildProgress(char.id)
  const cl = checklists[char.id] || {}
  const elemColor = ELEMENT_COLORS[char.element] || '#ffffff'
  const priorityColor = PRIORITY_COLORS[char.priority]
  const equippedCount = PIECE_KEYS.filter(p => cl[p]).length
  const weaponLabel = WEAPON_LABELS[cl.weapon_tier || 'none']

  const outerRef = useRef(null)
  const flipTimerRef = useRef(null)
  const [flipped, setFlipped] = useState(false)
  const [flipDone, setFlipDone] = useState(false)
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, lx: 50, ly: 50 })

  // Touch: tap front flips card, tap back navigates to character page
  const handleClick = useCallback((e) => {
    if (IS_TOUCH) {
      if (!flipped) {
        setFlipped(true)
        flipTimerRef.current = setTimeout(() => setFlipDone(true), 520)
      } else {
        navigate(`/character/${char.id}`)
      }
      return
    }
    navigate(`/character/${char.id}`)
  }, [flipped, navigate, char.id])

  // Tap outside card on mobile → flip back to front
  useEffect(() => {
    if (!IS_TOUCH || !flipped) return
    const handleOutside = (e) => {
      if (outerRef.current && !outerRef.current.contains(e.target)) {
        clearTimeout(flipTimerRef.current)
        setFlipped(false)
        setFlipDone(false)
      }
    }
    document.addEventListener('touchstart', handleOutside, { passive: true })
    return () => document.removeEventListener('touchstart', handleOutside)
  }, [flipped])

  // Desktop: hover triggers flip, then tilt
  const handleMouseEnter = useCallback(() => {
    if (IS_TOUCH) return
    setFlipped(true)
    flipTimerRef.current = setTimeout(() => setFlipDone(true), 520)
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (IS_TOUCH) return
    clearTimeout(flipTimerRef.current)
    setFlipped(false)
    setFlipDone(false)
    setTilt({ rx: 0, ry: 0, lx: 50, ly: 50 })
  }, [])

  const handleMouseMove = useCallback((e) => {
    if (IS_TOUCH || !flipDone || !outerRef.current) return
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
        height: 220,
        cursor: 'pointer',
        borderRadius: 16,
        perspective: '900px',
        WebkitTapHighlightColor: 'transparent',
        boxShadow: flipped
          ? `0 8px 32px ${elemColor}44, 0 2px 8px rgba(0,0,0,0.5)`
          : `0 4px 16px ${elemColor}22, 0 2px 4px rgba(0,0,0,0.3)`,
        transition: 'box-shadow 0.3s ease',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    >
      {/* Tilt layer */}
      <div style={{
        width: '100%', height: '100%', transformStyle: 'preserve-3d',
        transform: flipDone && !IS_TOUCH
          ? `rotateX(${tilt.rx}deg) rotateY(${-tilt.ry}deg) scale(1.04)`
          : flipped ? 'scale(1.01)' : 'scale(1)',
        transition: flipDone && !IS_TOUCH ? 'transform 0.08s ease-out' : 'transform 0.4s ease-out',
      }}>
        {/* Flip layer */}
        <div style={{
          width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: 'transform 0.5s ease-in-out', borderRadius: 16,
        }}>

          {/* FRONT FACE */}
          <div style={{
            position: 'absolute', inset: 0,
            backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
            borderRadius: 16, overflow: 'hidden',
            border: `1.5px solid ${elemColor}44`,
          }}>
            {char.image ? (
              <img
                src={char.image}
                alt={char.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block' }}
              />
            ) : (
              <div style={{
                width: '100%', height: '100%',
                background: `linear-gradient(155deg, ${char.colors?.bgFrom || '#111'} 0%, ${char.colors?.bgVia || '#1a1a2e'} 55%, ${elemColor}28 100%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 80, fontWeight: 800, color: elemColor, opacity: 0.12, fontFamily: 'serif', userSelect: 'none' }}>
                  {char.name[0]}
                </span>
              </div>
            )}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: '65%',
              background: 'linear-gradient(to top, rgba(4,4,8,0.97) 0%, rgba(4,4,8,0.55) 55%, transparent 100%)',
              pointerEvents: 'none',
            }} />
            <div style={{
              position: 'absolute', top: 10, right: 10,
              width: 24, height: 24, borderRadius: '50%',
              background: `${priorityColor}20`, border: `1.5px solid ${priorityColor}99`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, fontWeight: 700, color: priorityColor, backdropFilter: 'blur(6px)',
            }}>
              {char.priority}
            </div>
            <div style={{ position: 'absolute', top: 12, left: 10, display: 'flex', gap: 2 }}>
              {Array(char.rarity).fill(0).map((_, i) => (
                <div key={i} style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: char.rarity === 5 ? '#FFD700' : '#C084FC', opacity: 0.9,
                }} />
              ))}
            </div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '8px 11px 11px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{char.name}</span>
                <span style={{
                  fontSize: 7, fontWeight: 700, padding: '1px 5px', borderRadius: 4,
                  background: `${elemColor}22`, color: elemColor, border: `1px solid ${elemColor}44`,
                }}>
                  {char.element.toUpperCase()}
                </span>
              </div>
              <div style={{ fontSize: 9, color: 'rgba(160,163,176,0.65)', marginBottom: 5 }}>
                {char.weapon} · {char.role}
              </div>
              <div style={{ height: 2, borderRadius: 2, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress}%`, borderRadius: 2, background: `linear-gradient(90deg, ${elemColor}88, ${elemColor})` }} />
              </div>
              <div style={{ fontSize: 9, color: 'rgba(160,163,176,0.4)', marginTop: 2 }}>{progress}% built</div>
            </div>
            {IS_TOUCH && (
              <div style={{
                position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
                fontSize: 7, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.06em',
                pointerEvents: 'none', whiteSpace: 'nowrap',
              }}>
                TAP TO FLIP
              </div>
            )}
          </div>

          {/* BACK FACE */}
          <div style={{
            position: 'absolute', inset: 0,
            backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)', borderRadius: 16, overflow: 'hidden',
            border: `1.5px solid ${elemColor}66`,
            background: `linear-gradient(160deg, rgba(8,8,20,0.97) 0%, ${elemColor}28 100%)`,
            display: 'flex', flexDirection: 'column', padding: '10px 12px 11px', gap: 7,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{char.name}</span>
              <span style={{
                fontSize: 7, fontWeight: 700, padding: '1px 5px', borderRadius: 4,
                background: `${elemColor}22`, color: elemColor, border: `1px solid ${elemColor}44`,
              }}>
                {char.element.toUpperCase()}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <ProgressRing progress={progress} size={40} color={elemColor} strokeWidth={3} showText />
              <div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginBottom: 2 }}>Build Score</div>
                <div style={{ fontSize: 10, color: elemColor, fontWeight: 600 }}>Weapon: {weaponLabel}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>Pieces: {equippedCount}/5</div>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>ARTIFACTS</div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {PIECE_KEYS.map((k, i) => (
                  <span key={k} style={{ fontSize: 17, opacity: cl[k] ? 1 : 0.2, filter: cl[k] ? 'none' : 'grayscale(1)' }}>
                    {PIECE_ICONS[i]}
                  </span>
                ))}
              </div>
            </div>
            {IS_TOUCH ? (
              <div style={{
                marginTop: 'auto', padding: '6px 10px', borderRadius: 8, textAlign: 'center',
                background: `${elemColor}18`, border: `1px solid ${elemColor}55`,
                fontSize: 10, fontWeight: 700, color: elemColor, letterSpacing: '0.04em',
              }}>
                TAP TO VIEW DETAILS →
              </div>
            ) : (
              <div style={{
                marginTop: 'auto', fontSize: 8,
                color: 'rgba(255,255,255,0.18)', textAlign: 'center', letterSpacing: '0.04em',
              }}>
                CLICK TO VIEW DETAILS
              </div>
            )}
            {flipDone && !IS_TOUCH && (
              <div style={{
                position: 'absolute', inset: 0, borderRadius: 16, pointerEvents: 'none',
                background: `radial-gradient(circle at ${tilt.lx}% ${tilt.ly}%, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 40%, transparent 65%)`,
                mixBlendMode: 'overlay',
              }} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
