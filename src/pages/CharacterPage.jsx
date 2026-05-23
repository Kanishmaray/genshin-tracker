import React, { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Plus, Trash2, Check, BookOpen, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react'
import { CHARACTERS, TEAMS } from '../data/characters'
import { useGameData } from '../lib/useGameData'
import FloatingParticles from '../components/common/FloatingParticles'
import GlowCard from '../components/common/GlowCard'
import ProgressRing from '../components/common/ProgressRing'
import StarRating from '../components/common/StarRating'
import ElementBadge from '../components/common/ElementBadge'

const PRIORITY_LABELS = { S: 'Top Priority', A: 'High Priority', B: 'Medium', C: 'Low Priority' }
const PRIORITY_COLORS = { S: '#FFD700', A: '#C084FC', B: '#60A5FA', C: '#6B7280' }
const TIER_COLORS = { none: '#6B7280', f2p: '#60A5FA', bp: '#C084FC', bis: '#FFD700' }

// ── Collapsible section wrapper ───────────────────────────────────────────────
function Section({ title, color, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${color}22` }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
        style={{ background: `${color}0a` }}
      >
        <h2 className="font-display text-sm font-semibold tracking-wider" style={{ color }}>{title}</h2>
        {open ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Artifact slot card ────────────────────────────────────────────────────────
function ArtifactCard({ piece, cl, color, onTogglePiece, onToggleStat, onLvChange }) {
  const { key, label, emoji, stat, fixed } = piece
  const hasPiece = !!cl[key]
  const hasRightStat = fixed ? true : !!cl[key + '_mainstat']
  const isPerfect = hasPiece && hasRightStat
  const lv = cl[key + '_lv'] || 0

  let cardStyle
  if (isPerfect) {
    cardStyle = {
      background: 'linear-gradient(135deg, rgba(255,210,0,0.12) 0%, rgba(255,105,180,0.10) 100%)',
      border: '1.5px solid rgba(255,210,0,0.55)',
      boxShadow: '0 0 22px rgba(255,210,0,0.28), 0 0 44px rgba(255,105,180,0.16)',
    }
  } else if (hasPiece) {
    cardStyle = {
      background: `${color}10`,
      border: `1.5px solid ${color}55`,
      boxShadow: `0 0 18px ${color}22`,
    }
  } else {
    cardStyle = {
      background: 'rgba(255,255,255,0.025)',
      border: '1px solid rgba(255,255,255,0.06)',
    }
  }

  return (
    <div style={{ borderRadius: 14, padding: 12, transition: 'all 0.35s', ...cardStyle }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 20, opacity: hasPiece ? 1 : 0.28, transition: 'opacity 0.3s' }}>{emoji}</span>
        <span style={{
          fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
          color: isPerfect ? '#FFD700' : hasPiece ? color : '#374151',
          textShadow: isPerfect ? '0 0 14px rgba(255,210,0,0.7)' : hasPiece ? `0 0 10px ${color}77` : 'none',
          transition: 'all 0.3s',
        }}>{label}</span>
      </div>

      {/* Target stat */}
      {stat && (
        <div style={{
          fontSize: 11, marginBottom: 10,
          color: isPerfect ? 'rgba(255,210,0,0.85)' : hasPiece ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.18)',
          fontStyle: hasPiece ? 'normal' : 'italic',
          transition: 'all 0.3s',
        }}>
          {stat}
        </div>
      )}

      {/* Checkboxes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: hasPiece ? 10 : 0 }}>
        {/* Got piece / Got it */}
        <button
          onClick={() => {
            const next = !hasPiece
            onTogglePiece(next)
            // if unchecking piece, also clear stat
            if (!next) onToggleStat(false)
          }}
          style={{
            display: 'flex', alignItems: 'center', gap: 7, background: 'none',
            border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left',
          }}
        >
          <span style={{
            width: 17, height: 17, borderRadius: 5, flexShrink: 0,
            background: hasPiece ? (isPerfect ? '#FFD700' : color) : 'rgba(255,255,255,0.06)',
            border: `1px solid ${hasPiece ? (isPerfect ? '#FFD700' : color) : 'rgba(255,255,255,0.14)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
          }}>
            {hasPiece && (
              <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                <path d="M1 3.5L3.5 6L8 1" stroke="#000" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </span>
          <span style={{ fontSize: 11, color: hasPiece ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.28)' }}>
            {fixed ? 'Got it' : 'Got piece'}
          </span>
        </button>

        {/* Right main stat (variable pieces only) */}
        {!fixed && (
          <button
            onClick={() => hasPiece && onToggleStat(!hasRightStat)}
            disabled={!hasPiece}
            style={{
              display: 'flex', alignItems: 'center', gap: 7, background: 'none',
              border: 'none', padding: 0, cursor: hasPiece ? 'pointer' : 'not-allowed',
              opacity: hasPiece ? 1 : 0.35, textAlign: 'left', transition: 'opacity 0.2s',
            }}
          >
            <span style={{
              width: 17, height: 17, borderRadius: 5, flexShrink: 0,
              background: hasRightStat ? '#FFD700' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${hasRightStat ? '#FFD700' : 'rgba(255,255,255,0.14)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}>
              {hasRightStat && (
                <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                  <path d="M1 3.5L3.5 6L8 1" stroke="#000" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </span>
            <span style={{ fontSize: 11, color: hasRightStat ? 'rgba(255,210,0,0.9)' : 'rgba(255,255,255,0.28)' }}>
              Right main stat ✦
            </span>
          </button>
        )}
      </div>

      {/* Level slider — only when piece equipped */}
      {hasPiece && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', minWidth: 18 }}>+{lv}</span>
          <input
            type="range" min={0} max={20} step={4}
            value={lv}
            onChange={e => onLvChange(parseInt(e.target.value))}
            style={{ flex: 1, accentColor: isPerfect ? '#FFD700' : color, cursor: 'pointer' }}
          />
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', minWidth: 16, textAlign: 'right' }}>20</span>
        </div>
      )}
    </div>
  )
}

// ── Flippable weapon card ─────────────────────────────────────────────────────
function WeaponFlipCard({ label, name, tier, color, selected, onClick }) {
  const [hovered, setHovered] = useState(false)
  const tc = TIER_COLORS[tier] || color

  return (
    <div
      style={{ perspective: '800px', cursor: 'pointer', height: 88, flex: 1, minWidth: 72 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <motion.div
        animate={{ rotateY: hovered ? 180 : 0 }}
        transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ transformStyle: 'preserve-3d', position: 'relative', height: '100%', width: '100%' }}
      >
        {/* Front: tier badge */}
        <div style={{
          backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
          position: 'absolute', inset: 0, borderRadius: 12,
          background: selected ? `${tc}20` : 'rgba(255,255,255,0.03)',
          border: selected ? `1.5px solid ${tc}66` : `1px solid rgba(255,255,255,0.08)`,
          boxShadow: selected ? `0 0 18px ${tc}28, inset 0 0 12px ${tc}08` : 'none',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 8,
        }}>
          <span style={{
            fontSize: 20, fontWeight: 800, color: tc, letterSpacing: '0.05em',
            textShadow: selected ? `0 0 14px ${tc}99` : 'none',
          }}>
            {label}
          </span>
          {selected && (
            <div style={{ display: 'flex', gap: 3 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: tc, opacity: 0.8 }} />
              ))}
            </div>
          )}
        </div>

        {/* Back: weapon name */}
        <div style={{
          backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          position: 'absolute', inset: 0, borderRadius: 12,
          background: selected ? `${tc}22` : 'rgba(255,255,255,0.05)',
          border: selected ? `1.5px solid ${tc}66` : `1px solid rgba(255,255,255,0.12)`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '8px 10px', textAlign: 'center',
        }}>
          <span style={{ fontSize: 8, fontWeight: 700, color: tc, letterSpacing: '0.12em', marginBottom: 5, textTransform: 'uppercase' }}>
            {label}
          </span>
          <span style={{ fontSize: 9.5, color: 'rgba(210,215,225,0.9)', lineHeight: 1.35, fontWeight: selected ? 600 : 400 }}>
            {name || '—'}
          </span>
        </div>
      </motion.div>
    </div>
  )
}

// ── Constellation node viewer ─────────────────────────────────────────────────
function ConstellationNodes({ constellations, currentConst, goalConst, color }) {
  const nodes = constellations.length > 0
    ? constellations
    : Array(6).fill(null).map((_, i) => ({ level: `C${i + 1}` }))

  const n = Math.min(nodes.length, 6)
  const cx = 110, cy = 110, r = 78

  const positions = Array(n).fill(0).map((_, i) => {
    const angle = (-90 + i * (360 / n)) * (Math.PI / 180)
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <svg viewBox="0 0 220 220" style={{ width: '100%', maxWidth: 240 }}>
        {/* Connecting lines between adjacent nodes */}
        {positions.map((pos, i) => {
          const next = positions[(i + 1) % n]
          const bothUnlocked = i < currentConst && i + 1 < currentConst
          return (
            <line key={i} x1={pos.x} y1={pos.y} x2={next.x} y2={next.y}
              stroke={bothUnlocked ? `${color}44` : 'rgba(255,255,255,0.07)'}
              strokeWidth={bothUnlocked ? 1.5 : 1}
            />
          )
        })}

        {/* Spokes to center */}
        {positions.map((pos, i) => (
          <line key={`sp${i}`} x1={cx} y1={cy} x2={pos.x} y2={pos.y}
            stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
        ))}

        {/* Center gem */}
        <circle cx={cx} cy={cy} r={18} fill={`${color}12`} stroke={`${color}33`} strokeWidth="1.5" />
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="14" fill={color} opacity={0.75}>✦</text>

        {/* Nodes */}
        {nodes.slice(0, n).map((node, i) => {
          const { x, y } = positions[i]
          const unlocked = i < currentConst
          const isGoal = goalConst > 0 && i === goalConst - 1

          return (
            <g key={i}>
              {unlocked && <circle cx={x} cy={y} r={24} fill={`${color}0d`} />}
              {isGoal && (
                <circle cx={x} cy={y} r={21} fill="none"
                  stroke="#FFD700" strokeWidth="1.5" strokeDasharray="4 3" opacity={0.8} />
              )}
              <circle cx={x} cy={y} r={16}
                fill={unlocked ? `${color}28` : 'rgba(255,255,255,0.04)'}
                stroke={unlocked ? color : 'rgba(255,255,255,0.14)'}
                strokeWidth={unlocked ? 1.5 : 1}
              />
              {unlocked && <circle cx={x - 4} cy={y - 5} r={3} fill={`${color}55`} />}
              <text x={x} y={node?.name ? y - 3 : y}
                textAnchor="middle" dominantBaseline="middle"
                fontSize="9.5" fontWeight="700"
                fill={unlocked ? color : 'rgba(255,255,255,0.25)'}>
                {node?.level || `C${i + 1}`}
              </text>
              {node?.name && (
                <text x={x} y={y + 6} textAnchor="middle" dominantBaseline="middle"
                  fontSize="5.5" fill={unlocked ? `${color}bb` : 'rgba(255,255,255,0.18)'}>
                  {node.name.slice(0, 10)}
                </text>
              )}
            </g>
          )
        })}
      </svg>

      <div style={{ display: 'flex', gap: 16, fontSize: 10, color: 'rgba(160,163,176,0.55)' }}>
        <span>● Unlocked: C{currentConst}</span>
        {goalConst > 0 && <span style={{ color: '#FFD70099' }}>◌ Goal: C{goalConst}</span>}
      </div>
    </div>
  )
}

// ── Stat radar chart ──────────────────────────────────────────────────────────
function StatRadar({ statGoals, checklist, color }) {
  const n = statGoals.length
  if (n < 3) return null

  const cx = 110, cy = 115, maxR = 72
  const gridLevels = 4

  const getPos = (i, rr) => {
    const angle = (-90 + (360 / n) * i) * (Math.PI / 180)
    return { x: cx + rr * Math.cos(angle), y: cy + rr * Math.sin(angle) }
  }

  const gridRings = Array(gridLevels).fill(0).map((_, li) => {
    const rr = maxR * (li + 1) / gridLevels
    return Array(n).fill(0).map((_, j) => {
      const p = getPos(j, rr)
      return `${p.x},${p.y}`
    }).join(' ')
  })

  const dataPoints = statGoals.map((_, i) => {
    const key = `stat_goal_${i + 1}`
    const filled = checklist[key] ? 1.0 : 0.18
    const p = getPos(i, maxR * filled)
    return `${p.x},${p.y}`
  }).join(' ')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg viewBox="0 0 220 230" style={{ width: '100%', maxWidth: 260 }}>
        {/* Grid rings */}
        {gridRings.map((points, i) => (
          <polygon key={i} points={points}
            fill={i === gridLevels - 1 ? `${color}04` : 'none'}
            stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        ))}

        {/* Axis lines */}
        {statGoals.map((_, i) => {
          const p = getPos(i, maxR)
          return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y}
            stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
        })}

        {/* Filled polygon */}
        <polygon points={dataPoints}
          fill={`${color}22`} stroke={color} strokeWidth="1.5" strokeLinejoin="round" />

        {/* Data points */}
        {statGoals.map((_, i) => {
          const key = `stat_goal_${i + 1}`
          const filled = checklist[key] ? 1.0 : 0.18
          const p = getPos(i, maxR * filled)
          return (
            <circle key={i} cx={p.x} cy={p.y} r={checklist[key] ? 4.5 : 3}
              fill={checklist[key] ? color : 'rgba(255,255,255,0.18)'}
              stroke={checklist[key] ? `${color}55` : 'none'} strokeWidth="4" />
          )
        })}

        {/* Labels */}
        {statGoals.map((goal, i) => {
          const p = getPos(i, maxR + 22)
          let anchor = 'middle'
          if (p.x < cx - 8) anchor = 'end'
          else if (p.x > cx + 8) anchor = 'start'
          const checked = !!checklist[`stat_goal_${i + 1}`]
          return (
            <g key={i}>
              <text x={p.x} y={p.y - 3} textAnchor={anchor} dominantBaseline="middle"
                fontSize="8.5" fontWeight={checked ? '700' : '400'}
                fill={checked ? color : 'rgba(160,163,176,0.6)'}>
                {goal.label}
              </text>
              <text x={p.x} y={p.y + 8} textAnchor={anchor} dominantBaseline="middle"
                fontSize="7" fill="rgba(160,163,176,0.35)">
                {goal.range}
              </text>
            </g>
          )
        })}
      </svg>
      <p style={{ fontSize: 10, color: 'rgba(160,163,176,0.4)', marginTop: -4 }}>
        Axes expand as stat goals are checked ✓
      </p>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function CharacterPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const char = CHARACTERS[id]

  const {
    checklists, todos, notes,
    updateChecklist, addTodo, toggleTodo, deleteTodo, updateNotes,
    buildProgress, buildScore,
  } = useGameData()

  const cl = checklists[id] || {}
  const charTodos = todos[id] || []
  const charNotes = notes[id] || { general: '', plans: '' }
  const progress = buildProgress(id)

  const [newTodoText, setNewTodoText] = useState('')
  const [activeTab, setActiveTab] = useState('build')

  if (!char) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-96 gap-4">
        <p className="text-gray-400">Character not found.</p>
        <button onClick={() => navigate('/')} className="text-amber-400 hover:underline">Go back</button>
      </div>
    )
  }

  const { colors } = char
  const TABS = ['build', 'reference', 'notes']

  function handleAddTodo(e) {
    e.preventDefault()
    if (!newTodoText.trim()) return
    addTodo(id, { text: newTodoText.trim() })
    setNewTodoText('')
  }

  const pieces = [
    { key: 'flower',  label: 'Flower',  emoji: '🌸', fixed: true },
    { key: 'feather', label: 'Feather', emoji: '🪶', fixed: true },
    { key: 'sands',   label: 'Sands',   emoji: '⏳', stat: char.artifact.sands },
    { key: 'goblet',  label: 'Goblet',  emoji: '🏺', stat: char.artifact.goblet },
    { key: 'circlet', label: 'Circlet', emoji: '👑', stat: char.artifact.circlet },
  ]

  const constellations = char.constellations || []
  const currentConst = cl.const_current ?? char.constellation.current

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-full">

      {/* ── Hero Header ── */}
      <div
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${colors.bgFrom} 0%, ${colors.bgVia} 60%, #090b0f 100%)`,
          minHeight: 200,
        }}
      >
        <FloatingParticles color={colors.primary} count={18} />

        {(char.banner || char.image) ? (
          <div className="absolute inset-0 pointer-events-none" style={{ overflow: 'hidden' }}>
            <div style={{
              position: 'absolute', right: 0, top: 0, bottom: 0, width: '45%',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.6) 25%, rgba(0,0,0,0.9) 60%, black 100%)',
              maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.6) 25%, rgba(0,0,0,0.9) 60%, black 100%)',
            }}>
              <img src={char.banner || char.image} alt={char.name} style={{
                width: '100%', height: '100%', objectFit: 'cover',
                objectPosition: 'top center', opacity: 0.55, display: 'block',
              }} />
            </div>
            <div style={{
              position: 'absolute', right: 0, top: 0, bottom: 0, width: '40%',
              background: `radial-gradient(ellipse at right center, ${colors.primary}22 0%, transparent 70%)`,
            }} />
          </div>
        ) : (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="absolute border rounded-full opacity-10" style={{
                width: 100 + i * 80, height: 100 + i * 80,
                right: -50 - i * 40, bottom: -50 - i * 40,
                borderColor: colors.primary,
              }} />
            ))}
          </div>
        )}

        <div className="relative z-10 p-4 md:p-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-gray-400 hover:text-gray-200 mb-4 transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="text-sm">Dashboard</span>
          </button>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <ElementBadge element={char.element} small />
                <span className="text-xs px-2 py-0.5 rounded-full text-gray-400"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {char.weapon}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                  style={{ color: PRIORITY_COLORS[char.priority], background: `${PRIORITY_COLORS[char.priority]}18`, border: `1px solid ${PRIORITY_COLORS[char.priority]}33` }}>
                  {char.priority} — {PRIORITY_LABELS[char.priority]}
                </span>
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-2"
                style={{ color: colors.primary, textShadow: `0 0 30px ${colors.primary}66` }}>
                {char.name}
              </h1>
              <div className="flex items-center gap-2 mb-2">
                <StarRating count={char.rarity} size="sm" />
                <span className="text-sm text-gray-400">{char.role}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Constellation:</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateChecklist(id, 'const_current', Math.max(0, currentConst - 1))}
                    className="w-5 h-5 rounded flex items-center justify-center text-xs text-gray-400 hover:text-gray-100 transition-colors"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >−</button>
                  <span className="text-sm font-bold px-2 min-w-[28px] text-center" style={{ color: colors.primary }}>C{currentConst}</span>
                  <button
                    onClick={() => updateChecklist(id, 'const_current', Math.min(6, currentConst + 1))}
                    className="w-5 h-5 rounded flex items-center justify-center text-xs text-gray-400 hover:text-gray-100 transition-colors"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >+</button>
                </div>
                {char.constellation.goal > 0 && (
                  <span className="text-xs text-gray-600">→ C{char.constellation.goal}</span>
                )}
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <ProgressRing progress={progress} color={colors.primary} size={72} strokeWidth={5} showText />
              <span className="text-xs text-gray-500">Build Score: {buildScore(id)}/9</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="sticky top-0 z-20 flex gap-1 px-4 py-2"
        style={{ background: 'var(--bg-base)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all"
            style={{
              background: activeTab === tab ? `${colors.primary}20` : 'transparent',
              color: activeTab === tab ? colors.primary : '#6B7280',
              border: activeTab === tab ? `1px solid ${colors.primary}44` : '1px solid transparent',
            }}>
            {tab}
          </button>
        ))}
      </div>

      <div className="p-4 md:p-6 space-y-4">

        {/* Important note banner */}
        {char.importantNote && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 rounded-xl p-3"
            style={{ background: '#FF3B3020', border: '1px solid #FF3B3044' }}>
            <AlertTriangle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-300">{char.importantNote}</p>
          </motion.div>
        )}

        {/* ── BUILD TAB ── */}
        {activeTab === 'build' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">

            <Section title="KIT OVERVIEW" color={colors.primary}>
              <p className="text-sm text-gray-300 leading-relaxed">{char.kit}</p>
              {char.futurePlans && (
                <p className="text-xs text-gray-500 mt-2 italic">{char.futurePlans}</p>
              )}
            </Section>

            <Section title="PLANS & NOTES" color={colors.secondary} defaultOpen={true}>
              <textarea
                className="w-full min-h-20 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none resize-none"
                placeholder="Your plans for this character..."
                value={charNotes.plans || ''}
                onChange={e => updateNotes(id, 'plans', e.target.value)}
              />
            </Section>

            {/* WEAPON — flippable cards */}
            <Section title="WEAPON" color={colors.primary}>
              <div className="flex gap-2 mb-2">
                {[
                  { tier: 'none', label: 'None', name: 'Not equipped' },
                  { tier: 'f2p', label: 'F2P', name: char.weapons.f2p },
                  ...(char.weapons.bp ? [{ tier: 'bp', label: 'BP', name: char.weapons.bp }] : []),
                  { tier: 'bis', label: 'BiS', name: char.weapons.bis },
                ].map(w => (
                  <WeaponFlipCard
                    key={w.tier}
                    label={w.label}
                    name={w.name}
                    tier={w.tier}
                    color={colors.primary}
                    selected={cl.weapon_tier === w.tier}
                    onClick={() => updateChecklist(id, 'weapon_tier', w.tier)}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-600 mt-1">Hover to see weapon name · Click to mark equipped</p>
            </Section>

            {/* ARTIFACTS */}
            <Section title="ARTIFACTS" color={colors.primary}>
              <div className="mb-3 text-sm text-gray-400">
                <span className="font-medium" style={{ color: colors.primary }}>{char.artifact.set}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {pieces.map(p => (
                  <ArtifactCard
                    key={p.key}
                    piece={p}
                    cl={cl}
                    color={colors.primary}
                    onTogglePiece={v => updateChecklist(id, p.key, v)}
                    onToggleStat={v => updateChecklist(id, p.key + '_mainstat', v)}
                    onLvChange={v => updateChecklist(id, p.key + '_lv', v)}
                  />
                ))}
              </div>
            </Section>

            {/* STAT GOALS — with radar chart */}
            <Section title="STAT GOALS" color={colors.accent || colors.primary}>
              <StatRadar statGoals={char.statGoals} checklist={cl} color={colors.primary} />
              <div className="space-y-2 mt-4">
                {char.statGoals.map((goal, i) => {
                  const key = `stat_goal_${i + 1}`
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <button onClick={() => updateChecklist(id, key, !cl[key])}
                        className="w-5 h-5 rounded flex-shrink-0 flex items-center justify-center transition-all"
                        style={{
                          background: cl[key] ? colors.primary : 'rgba(255,255,255,0.06)',
                          border: `1px solid ${cl[key] ? colors.primary : 'rgba(255,255,255,0.12)'}`,
                        }}>
                        {cl[key] && <Check size={10} className="text-black" />}
                      </button>
                      <span className="text-sm font-medium text-gray-200">{goal.label}</span>
                      <span className="text-sm ml-auto" style={{ color: colors.primary }}>{goal.range}</span>
                    </div>
                  )
                })}
              </div>
            </Section>

            {/* TALENTS */}
            <Section title="TALENTS" color={colors.primary}>
              <div className="flex flex-col sm:flex-row gap-3 mb-3">
                {[
                  { key: 'skill_talent', label: 'Skill Talent' },
                  { key: 'burst_talent', label: 'Burst Talent' },
                ].map(t => (
                  <button key={t.key} onClick={() => updateChecklist(id, t.key, !cl[t.key])}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                    style={{
                      background: cl[t.key] ? `${colors.primary}20` : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${cl[t.key] ? colors.primary + '55' : 'rgba(255,255,255,0.08)'}`,
                      color: cl[t.key] ? colors.primary : '#9AA3B0',
                    }}>
                    {cl[t.key] && <Check size={14} />}
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <BookOpen size={14} />
                <span>{char.talentBooks.books.join(', ')}</span>
                <span className="text-gray-600">·</span>
                <span className="text-gray-500">{char.talentBooks.domain}</span>
                <span className="text-gray-600">·</span>
                <span style={{ color: colors.primary }}>{char.talentBooks.days.join(' / ')}</span>
              </div>
            </Section>

            {/* CHARACTER LEVEL */}
            <Section title="CHARACTER LEVEL" color={colors.primary} defaultOpen={false}>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">Level</span>
                <input type="range" min={1} max={90}
                  value={cl.char_level || 1}
                  onChange={e => updateChecklist(id, 'char_level', parseInt(e.target.value))}
                  style={{ accentColor: colors.primary }}
                  className="flex-1"
                />
                <span className="text-lg font-bold w-10 text-center" style={{ color: colors.primary }}>
                  {cl.char_level || 1}
                </span>
              </div>
            </Section>

            {/* TASK LIST */}
            <Section title="TASK LIST" color={colors.primary}>
              <div className="space-y-2 mb-3">
                {charTodos.length === 0 && <p className="text-gray-600 text-sm">No tasks yet.</p>}
                {charTodos.map(todo => {
                  const daysLeft = (() => {
                    if (!todo.completed || !todo.completedAt) return null
                    const elapsed = Date.now() - new Date(todo.completedAt).getTime()
                    return Math.max(0, 10 - Math.floor(elapsed / (24 * 60 * 60 * 1000)))
                  })()
                  return (
                    <div key={todo.id}
                      className="flex items-start gap-2 group rounded-lg px-2 py-1.5 transition-colors"
                      style={todo.completed ? { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' } : {}}>
                      <button onClick={() => toggleTodo(id, todo.id)}
                        className="w-5 h-5 rounded flex-shrink-0 flex items-center justify-center transition-all mt-0.5"
                        style={{
                          background: todo.completed ? colors.primary : 'rgba(255,255,255,0.06)',
                          border: `1px solid ${todo.completed ? colors.primary : 'rgba(255,255,255,0.12)'}`,
                        }}>
                        {todo.completed && <Check size={10} className="text-black" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <span className={`text-sm leading-tight ${todo.completed ? 'line-through text-gray-600' : 'text-gray-200'}`}>
                          {todo.text}
                        </span>
                        {todo.completed && daysLeft !== null && (
                          <div className="text-xs mt-0.5" style={{ color: daysLeft <= 2 ? '#F87171' : 'rgba(100,105,120,0.7)' }}>
                            ✓ Done · auto-removes in {daysLeft} day{daysLeft !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                      <button onClick={() => deleteTodo(id, todo.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-600 hover:text-red-400 flex-shrink-0">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )
                })}
              </div>
              <form onSubmit={handleAddTodo} className="flex gap-2">
                <input type="text" placeholder="Add a task..."
                  value={newTodoText} onChange={e => setNewTodoText(e.target.value)}
                  className="flex-1 text-sm bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-gray-200 placeholder-gray-600 focus:outline-none"
                />
                <button type="submit" className="p-1.5 rounded-lg transition-colors"
                  style={{ color: colors.primary, background: `${colors.primary}15` }}>
                  <Plus size={16} />
                </button>
              </form>
            </Section>
          </motion.div>
        )}

        {/* ── REFERENCE TAB ── */}
        {activeTab === 'reference' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">

            <Section title="WEAPONS" color={colors.primary}>
              <div className="space-y-2">
                {[
                  { tier: 'BiS', name: char.weapons.bis, color: '#FFD700' },
                  ...(char.weapons.bp ? [{ tier: 'BP', name: char.weapons.bp, color: '#A78BFA' }] : []),
                  { tier: 'F2P', name: char.weapons.f2p, color: '#60A5FA' },
                ].map(w => (
                  <div key={w.tier} className="flex items-center gap-3 py-1.5">
                    <span className="text-xs font-bold w-8" style={{ color: w.color }}>{w.tier}</span>
                    <span className="text-sm text-gray-200">{w.name}</span>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="ARTIFACT SET" color={colors.primary}>
              <div className="space-y-2">
                <div className="text-sm font-medium" style={{ color: colors.primary }}>{char.artifact.set}</div>
                {char.artifact.altSet && (
                  <div className="text-xs text-gray-500">{char.artifact.altSet}</div>
                )}
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {[
                    { label: 'Sands', val: char.artifact.sands },
                    { label: 'Goblet', val: char.artifact.goblet },
                    { label: 'Circlet', val: char.artifact.circlet },
                  ].map(slot => (
                    <div key={slot.label} className="rounded-lg p-2 bg-white/5 border border-white/[0.08]">
                      <div className="text-xs text-gray-500 mb-1">{slot.label}</div>
                      <div className="text-sm text-gray-200">{slot.val}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Section>

            <Section title="STAT GOALS" color={colors.primary}>
              <div className="space-y-3">
                {char.statGoals.map((g, i) => (
                  <div key={i} className="flex items-center justify-between py-1 border-b border-white/[0.04] last:border-0">
                    <span className="text-sm text-gray-300">{g.label}</span>
                    <span className="text-sm font-medium" style={{ color: colors.primary }}>{g.range}</span>
                  </div>
                ))}
              </div>
            </Section>

            {/* CONSTELLATIONS — node viewer + list */}
            {constellations.length > 0 && (
              <Section title="CONSTELLATIONS" color={colors.primary}>
                <ConstellationNodes
                  constellations={constellations}
                  currentConst={currentConst}
                  goalConst={char.constellation.goal}
                  color={colors.primary}
                />
                <div className="space-y-2 mt-4">
                  {constellations.map((c, i) => {
                    const isCurrent = i < currentConst
                    const isGoal = i === char.constellation.goal - 1
                    const priorityBadgeColor = {
                      High: '#F59E0B', Good: '#60A5FA', Medium: '#8B5CF6',
                      Low: '#6B7280', BEST: '#4ADE80', Current: '#2DD4BF',
                    }[c.priority] || '#6B7280'

                    return (
                      <div key={c.level} className="flex items-start gap-3 rounded-xl p-3"
                        style={{
                          background: isCurrent ? `${colors.primary}12` : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${isCurrent ? colors.primary + '33' : 'rgba(255,255,255,0.06)'}`,
                        }}>
                        <span className="text-xs font-bold flex-shrink-0 w-7 text-center py-0.5 rounded"
                          style={{ background: `${colors.primary}22`, color: colors.primary }}>
                          {c.level}
                        </span>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-200">{c.name || c.level}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{c.note}</div>
                        </div>
                        {c.priority && (
                          <span className="text-xs px-1.5 py-0.5 rounded flex-shrink-0"
                            style={{ background: `${priorityBadgeColor}18`, color: priorityBadgeColor, border: `1px solid ${priorityBadgeColor}33` }}>
                            {c.priority}
                          </span>
                        )}
                        {isGoal && <span className="text-xs text-amber-400 flex-shrink-0">← Goal</span>}
                      </div>
                    )
                  })}
                </div>
              </Section>
            )}

            {/* TEAMS */}
            <Section title="TEAMS" color={colors.primary}>
              {char.team.map(teamId => {
                const team = TEAMS[teamId]
                if (!team) return null
                return (
                  <div key={teamId} className="mb-3">
                    <div className="text-sm font-medium mb-2" style={{ color: team.color }}>{team.name}</div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {team.members.map(mid => (
                        <span key={mid} className="text-xs px-2 py-1 rounded-full"
                          style={{
                            background: `${CHARACTERS[mid]?.colors.primary}18`,
                            color: CHARACTERS[mid]?.colors.primary,
                            border: `1px solid ${CHARACTERS[mid]?.colors.primary}33`,
                          }}>
                          {CHARACTERS[mid]?.name}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">{team.synergy}</p>
                  </div>
                )
              })}
            </Section>
          </motion.div>
        )}

        {/* ── NOTES TAB ── */}
        {activeTab === 'notes' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <GlowCard color={colors.primary} className="p-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-2 font-display tracking-wider">GENERAL NOTES</h3>
              <textarea
                className="w-full min-h-32 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none resize-none"
                placeholder="General notes, observations, reminders..."
                value={charNotes.general || ''}
                onChange={e => updateNotes(id, 'general', e.target.value)}
              />
            </GlowCard>
            <GlowCard color={colors.secondary} className="p-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-2 font-display tracking-wider">BUILD PLANS</h3>
              <textarea
                className="w-full min-h-32 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none resize-none"
                placeholder="What are your plans for this character's build?"
                value={charNotes.plans || ''}
                onChange={e => updateNotes(id, 'plans', e.target.value)}
              />
            </GlowCard>
          </motion.div>
        )}

      </div>
    </motion.div>
  )
}
