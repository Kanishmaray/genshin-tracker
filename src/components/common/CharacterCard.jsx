import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGameData } from '../../lib/useGameData'
import ProgressRing from './ProgressRing'

const ELEMENT_COLORS = {
  Geo: '#D4A017',
  Electro: '#A855F7',
  Anemo: '#2DD4BF',
  Hydro: '#38BDF8',
  Pyro: '#FB923C',
  Cryo: '#94A3B8',
  Dendro: '#4ADE80',
}

const PRIORITY_COLORS = {
  S: '#FFD700',
  A: '#C084FC',
  B: '#60A5FA',
  C: '#6B7280',
}

const PIECE_ICONS = ['🌸', '🪶', '⏳', '🏺', '👑']
const PIECE_KEYS = ['flower', 'feather', 'sands', 'goblet', 'circlet']
const WEAPON_LABELS = { bis: 'BiS', bp: 'BP', f2p: 'F2P', none: '—' }

export default function CharacterCard({ char }) {
  const [hovered, setHovered] = useState(false)
  const navigate = useNavigate()
  const { buildProgress, checklists } = useGameData()

  const progress = buildProgress(char.id)
  const cl = checklists[char.id] || {}
  const elemColor = ELEMENT_COLORS[char.element] || '#ffffff'
  const priorityColor = PRIORITY_COLORS[char.priority]
  const equippedCount = PIECE_KEYS.filter(p => cl[p]).length
  const weaponLabel = WEAPON_LABELS[cl.weapon_tier || 'none']

  return (
    <div
      style={{ perspective: '1000px', cursor: 'pointer', height: 240 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/character/${char.id}`)}
      className="w-full"
    >
      <motion.div
        animate={{ rotateY: hovered ? 180 : 0 }}
        transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ transformStyle: 'preserve-3d', position: 'relative', height: '100%', width: '100%' }}
      >

        {/* ── FRONT ─────────────────────────────────────── */}
        <div
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            position: 'absolute',
            inset: 0,
            borderRadius: 16,
            overflow: 'hidden',
            border: `1px solid ${elemColor}33`,
            boxShadow: `0 4px 24px rgba(0,0,0,0.45)`,
          }}
        >
          {/* Portrait image or fallback */}
          {char.image ? (
            <img
              src={char.image}
              alt={char.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block' }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                background: `linear-gradient(155deg, ${char.colors.bgFrom} 0%, ${char.colors.bgVia} 55%, ${elemColor}28 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              {/* Decorative concentric rings */}
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    right: -20 - i * 30,
                    bottom: -20 - i * 30,
                    width: 90 + i * 65,
                    height: 90 + i * 65,
                    borderRadius: '50%',
                    border: `1px solid ${elemColor}`,
                    opacity: 0.07 + i * 0.02,
                  }}
                />
              ))}
              <span
                style={{
                  fontSize: 88,
                  fontWeight: 800,
                  color: elemColor,
                  opacity: 0.12,
                  fontFamily: 'serif',
                  userSelect: 'none',
                  position: 'relative',
                  zIndex: 1,
                  lineHeight: 1,
                }}
              >
                {char.name[0]}
              </span>
            </div>
          )}

          {/* Bottom gradient scrim */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '58%',
              background: 'linear-gradient(to top, rgba(4,4,8,0.96) 0%, rgba(4,4,8,0.55) 55%, transparent 100%)',
              pointerEvents: 'none',
            }}
          />

          {/* Priority badge — top right */}
          <div
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              width: 26,
              height: 26,
              borderRadius: '50%',
              background: `${priorityColor}20`,
              border: `1.5px solid ${priorityColor}99`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              fontWeight: 700,
              color: priorityColor,
              backdropFilter: 'blur(6px)',
            }}
          >
            {char.priority}
          </div>

          {/* Rarity dots — top left */}
          <div
            style={{
              position: 'absolute',
              top: 12,
              left: 10,
              display: 'flex',
              gap: 2.5,
            }}
          >
            {Array(char.rarity).fill(0).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: char.rarity === 5 ? '#FFD700' : '#C084FC',
                  boxShadow: `0 0 5px ${char.rarity === 5 ? '#FFD700' : '#C084FC'}`,
                  opacity: 0.9,
                }}
              />
            ))}
          </div>

          {/* Bottom info overlay */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '10px 12px 13px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', letterSpacing: '0.02em' }}>
                {char.name}
              </span>
              <span
                style={{
                  fontSize: 8,
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: 4,
                  background: `${elemColor}22`,
                  color: elemColor,
                  border: `1px solid ${elemColor}44`,
                  letterSpacing: '0.1em',
                  backdropFilter: 'blur(4px)',
                }}
              >
                {char.element.toUpperCase()}
              </span>
            </div>
            <div style={{ fontSize: 10, color: 'rgba(160,163,176,0.75)', marginBottom: 7 }}>
              {char.weapon} · {char.role}
            </div>
            {/* Mini build progress bar */}
            <div style={{ height: 2, borderRadius: 2, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${progress}%`,
                  borderRadius: 2,
                  background: `linear-gradient(90deg, ${elemColor}88, ${elemColor})`,
                }}
              />
            </div>
            <div style={{ fontSize: 9, color: 'rgba(160,163,176,0.45)', marginTop: 3 }}>
              {progress}% built
            </div>
          </div>
        </div>

        {/* ── BACK ──────────────────────────────────────── */}
        <div
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            position: 'absolute',
            inset: 0,
            borderRadius: 16,
            overflow: 'hidden',
            border: `1px solid ${elemColor}55`,
            boxShadow: `0 4px 32px rgba(0,0,0,0.5), 0 0 24px ${elemColor}18`,
            background: `linear-gradient(145deg, ${char.colors.bgFrom} 0%, ${char.colors.bgVia} 55%, ${elemColor}1a 100%)`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px 16px',
            gap: 8,
          }}
        >
          {/* Back decorative rings */}
          {[0, 1].map(i => (
            <div
              key={i}
              style={{
                position: 'absolute',
                right: -20 - i * 35,
                top: -20 - i * 35,
                width: 90 + i * 65,
                height: 90 + i * 65,
                borderRadius: '50%',
                border: `1px solid ${elemColor}`,
                opacity: 0.05,
                pointerEvents: 'none',
              }}
            />
          ))}

          <div
            style={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              width: '100%',
            }}
          >
            {/* Progress ring */}
            <ProgressRing progress={progress} color={elemColor} size={62} strokeWidth={4} showText />

            {/* Name + role */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff' }}>{char.name}</div>
              <div style={{ fontSize: 10, color: '#9AA3B0', marginTop: 2 }}>{char.role}</div>
            </div>

            {/* Artifact pieces — icon squares */}
            <div style={{ display: 'flex', gap: 5 }}>
              {PIECE_KEYS.map((p, i) => (
                <div
                  key={p}
                  title={p.charAt(0).toUpperCase() + p.slice(1)}
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 7,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    background: cl[p] ? `${elemColor}28` : 'rgba(255,255,255,0.04)',
                    border: cl[p] ? `1px solid ${elemColor}66` : '1px solid rgba(255,255,255,0.08)',
                    boxShadow: cl[p] ? `0 0 8px ${elemColor}22` : 'none',
                    opacity: cl[p] ? 1 : 0.3,
                    transition: 'all 0.2s',
                  }}
                >
                  {PIECE_ICONS[i]}
                </div>
              ))}
            </div>

            {/* Weapon + pieces count */}
            <div style={{ display: 'flex', gap: 10, fontSize: 10, color: '#6B7280' }}>
              <span>
                Weapon: <span style={{ color: elemColor, fontWeight: 600 }}>{weaponLabel}</span>
              </span>
              <span style={{ color: 'rgba(255,255,255,0.12)' }}>·</span>
              <span>
                Pieces: <span style={{ color: elemColor, fontWeight: 600 }}>{equippedCount}/5</span>
              </span>
            </div>

            {/* CTA */}
            <div
              style={{
                marginTop: 2,
                padding: '5px 20px',
                borderRadius: 20,
                background: `${elemColor}18`,
                border: `1px solid ${elemColor}55`,
                fontSize: 11,
                fontWeight: 600,
                color: elemColor,
                letterSpacing: '0.06em',
                boxShadow: `0 0 12px ${elemColor}18`,
              }}
            >
              View Build →
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  )
}
