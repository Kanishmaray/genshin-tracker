import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Target, Filter } from 'lucide-react'
import { CHARACTERS, CHARACTER_ORDER } from '../data/characters'
import { useGameData } from '../lib/useGameData'
import GlowCard from '../components/common/GlowCard'
import ProgressRing from '../components/common/ProgressRing'
import ElementBadge from '../components/common/ElementBadge'
import FloatingParticles from '../components/common/FloatingParticles'

const PRIORITY_TIERS = ['S', 'A', 'B', 'C']
const PRIORITY_LABELS = { S: 'S — Top Priority', A: 'A — High Priority', B: 'B — Medium Priority', C: 'C — Low Priority' }
const PRIORITY_COLORS = { S: '#FFD700', A: '#C084FC', B: '#60A5FA', C: '#6B7280' }

const STATUS_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'currently_building', label: 'Building' },
  { key: 'paused', label: 'Paused' },
  { key: 'future_project', label: 'Future' },
]

const STATUS_COLORS = {
  currently_building: '#4ADE80',
  paused: '#FB923C',
  future_project: '#60A5FA',
}

const STATUS_LABELS = {
  currently_building: 'Building',
  paused: 'Paused',
  future_project: 'Future',
}

function getOutstandingItems(char, cl) {
  const items = []
  if (!cl.weapon_tier || cl.weapon_tier === 'none') items.push('Equip a weapon')
  else if (cl.weapon_tier === 'f2p') items.push('Upgrade to BP/BiS weapon')
  const pieces = ['flower', 'feather', 'sands', 'goblet', 'circlet']
  const missing = pieces.filter(p => !cl[p])
  if (missing.length > 0) items.push(`Farm artifacts: ${missing.join(', ')}`)
  const lowLevel = pieces.filter(p => cl[p] && (cl[p + '_lv'] || 0) < 16)
  if (lowLevel.length > 0) items.push(`Level up artifacts to +16: ${lowLevel.join(', ')}`)
  if (!cl.stat_goal_1 || !cl.stat_goal_2 || !cl.stat_goal_3) items.push('Hit stat goals')
  if (!cl.skill_talent) items.push('Level Skill talent')
  if (!cl.burst_talent) items.push('Level Burst talent')
  if (char.constellation.goal > (cl.const_current || char.constellation.current))
    items.push(`Get to C${char.constellation.goal}`)
  return items.slice(0, 4)
}

const stagger = {
  animate: { transition: { staggerChildren: 0.05 } },
}

const item = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0 },
}

export default function PrioritiesPage() {
  const navigate = useNavigate()
  const { buildProgress, checklists } = useGameData()
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = useMemo(() => {
    return CHARACTER_ORDER.filter(id => {
      const char = CHARACTERS[id]
      if (statusFilter === 'all') return true
      return char.status === statusFilter
    })
  }, [statusFilter])

  const groupedByPriority = useMemo(() => {
    return PRIORITY_TIERS.reduce((acc, tier) => {
      acc[tier] = filtered.filter(id => CHARACTERS[id].priority === tier)
      return acc
    }, {})
  }, [filtered])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-full p-4 md:p-6"
    >
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-amber-400 mb-1">Priorities</h1>
        <p className="text-gray-500 text-sm">Your build priorities ranked by tier</p>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <Filter size={14} className="text-gray-500" />
        {STATUS_FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
            style={{
              background: statusFilter === f.key ? 'rgba(212,160,23,0.2)' : 'rgba(255,255,255,0.04)',
              color: statusFilter === f.key ? '#D4A017' : '#6B7280',
              border: statusFilter === f.key ? '1px solid rgba(212,160,23,0.4)' : '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {PRIORITY_TIERS.map(tier => {
          const chars = groupedByPriority[tier]
          if (!chars || chars.length === 0) return null
          const tierColor = PRIORITY_COLORS[tier]

          return (
            <div key={tier}>
              {/* Tier header */}
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-bold text-lg"
                  style={{ background: `${tierColor}20`, color: tierColor, border: `1px solid ${tierColor}44` }}
                >
                  {tier}
                </div>
                <h2 className="font-display text-sm font-semibold tracking-wider" style={{ color: tierColor }}>
                  {PRIORITY_LABELS[tier]}
                </h2>
                <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${tierColor}33, transparent)` }} />
              </div>

              <motion.div
                variants={stagger}
                initial="initial"
                animate="animate"
                className="space-y-3"
              >
                {chars.map(id => {
                  const char = CHARACTERS[id]
                  const p = buildProgress(id)
                  const cl = checklists[id] || {}
                  const outstanding = getOutstandingItems(char, cl)
                  const statusColor = STATUS_COLORS[char.status] || '#6B7280'

                  return (
                    <motion.div key={id} variants={item}>
                      <GlowCard color={char.colors.primary} hoverable className="overflow-hidden">
                        <div
                          className="relative"
                          style={{ borderLeft: `3px solid ${char.colors.primary}` }}
                        >
                          <button
                            onClick={() => navigate(`/character/${id}`)}
                            className="w-full text-left"
                          >
                            <div className="p-4">
                              <div className="flex items-start gap-4">
                                <ProgressRing
                                  progress={p}
                                  color={char.colors.primary}
                                  size={52}
                                  strokeWidth={4}
                                  showText
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <span className="font-display font-bold text-base" style={{ color: char.colors.primary }}>
                                      {char.name}
                                    </span>
                                    <ElementBadge element={char.element} small />
                                    <span
                                      className="text-xs px-2 py-0.5 rounded-full"
                                      style={{ background: `${statusColor}18`, color: statusColor, border: `1px solid ${statusColor}33` }}
                                    >
                                      {STATUS_LABELS[char.status] || char.status}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 mb-2">
                                    <span className="text-xs text-gray-500">{char.role}</span>
                                    <span className="text-gray-700">·</span>
                                    <span className="text-xs text-gray-500">
                                      C{char.constellation.current} → C{char.constellation.goal}
                                    </span>
                                  </div>

                                  {/* Progress bar */}
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                                      <motion.div
                                        className="h-full rounded-full"
                                        style={{ background: char.colors.primary }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${p}%` }}
                                        transition={{ duration: 0.8, delay: 0.1 }}
                                      />
                                    </div>
                                    <span className="text-xs text-gray-500 w-8 text-right">{p}%</span>
                                  </div>

                                  {/* Outstanding items */}
                                  {outstanding.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5">
                                      {outstanding.map((item, i) => (
                                        <span
                                          key={i}
                                          className="text-xs px-2 py-0.5 rounded-full"
                                          style={{ background: 'rgba(255,255,255,0.04)', color: '#9AA3B0', border: '1px solid rgba(255,255,255,0.06)' }}
                                        >
                                          {item}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  {outstanding.length === 0 && (
                                    <span className="text-xs text-green-400">Build looking solid!</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </button>
                        </div>
                      </GlowCard>
                    </motion.div>
                  )
                })}
              </motion.div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
