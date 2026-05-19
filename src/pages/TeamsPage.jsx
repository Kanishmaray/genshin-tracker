import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Users, Zap, Shield, Heart } from 'lucide-react'
import { CHARACTERS, TEAMS } from '../data/characters'
import { useGameData } from '../lib/useGameData'
import GlowCard from '../components/common/GlowCard'
import ProgressRing from '../components/common/ProgressRing'
import ElementBadge from '../components/common/ElementBadge'
import StarRating from '../components/common/StarRating'
import FloatingParticles from '../components/common/FloatingParticles'

const ROLE_ICONS = {
  'Main DPS': Zap,
  'Sub-DPS': Zap,
  'Support/Healer': Heart,
  'Healer/Shield': Shield,
  'Support': Users,
}

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
}

const item = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

export default function TeamsPage() {
  const navigate = useNavigate()
  const { buildProgress } = useGameData()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-full p-4 md:p-6"
    >
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-amber-400 mb-1">Teams</h1>
        <p className="text-gray-500 text-sm">Your current team compositions and synergies</p>
      </div>

      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="grid md:grid-cols-2 gap-6"
      >
        {Object.values(TEAMS).map(team => {
          const teamProgress = Math.round(
            team.members.reduce((sum, id) => sum + buildProgress(id), 0) / team.members.length
          )

          return (
            <motion.div key={team.id} variants={item}>
              <GlowCard color={team.color} className="overflow-hidden">
                {/* Team header */}
                <div
                  className="relative px-5 py-4 overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${team.color}15, transparent)` }}
                >
                  <FloatingParticles color={team.color} count={8} />
                  <div className="relative z-10 flex items-center justify-between">
                    <div>
                      <h2 className="font-display text-lg font-bold" style={{ color: team.color }}>
                        {team.name}
                      </h2>
                      <p className="text-xs text-gray-500 mt-0.5">{team.members.length} members</p>
                    </div>
                    <ProgressRing progress={teamProgress} color={team.color} size={52} strokeWidth={4} showText />
                  </div>
                </div>

                {/* Members */}
                <div className="p-4 space-y-3">
                  {team.members.map(id => {
                    const char = CHARACTERS[id]
                    const p = buildProgress(id)
                    const RoleIcon = ROLE_ICONS[char.role] || Users

                    return (
                      <motion.button
                        key={id}
                        whileHover={{ x: 4 }}
                        onClick={() => navigate(`/character/${id}`)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors hover:bg-white/5 group"
                        style={{ border: `1px solid ${char.colors.primary}22` }}
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-display font-bold text-sm"
                          style={{
                            background: `linear-gradient(135deg, ${char.colors.bgFrom}, ${char.colors.bgVia})`,
                            border: `1px solid ${char.colors.primary}44`,
                            color: char.colors.primary,
                            textShadow: `0 0 8px ${char.colors.primary}66`,
                          }}
                        >
                          {char.name.slice(0, 2).toUpperCase()}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-gray-200">{char.name}</span>
                            <ElementBadge element={char.element} small />
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <RoleIcon size={11} style={{ color: char.colors.primary }} />
                            <span className="text-xs text-gray-500">{char.role}</span>
                            <span className="text-gray-700">·</span>
                            <StarRating count={char.rarity} size="sm" />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="text-right">
                            <div className="text-xs font-bold" style={{ color: char.colors.primary }}>{p}%</div>
                            <div className="text-xs text-gray-600">built</div>
                          </div>
                          <ProgressRing progress={p} color={char.colors.primary} size={32} strokeWidth={2.5} showText={false} />
                        </div>
                      </motion.button>
                    )
                  })}
                </div>

                {/* Synergy notes */}
                <div className="px-4 pb-4">
                  <div
                    className="rounded-xl p-3 text-xs text-gray-400 leading-relaxed"
                    style={{ background: `${team.color}08`, border: `1px solid ${team.color}1a` }}
                  >
                    <span className="font-semibold" style={{ color: team.color }}>Synergy: </span>
                    {team.synergy}
                  </div>
                </div>
              </GlowCard>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Aino special note */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6"
      >
        <GlowCard color="#5EEAD4" className="p-4">
          <div className="flex items-start gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: '#5EEAD420', border: '1px solid #5EEAD433' }}
            >
              <Heart size={16} className="text-teal-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-teal-400 mb-1">Shared Support: Aino</h3>
              <p className="text-xs text-gray-400">
                Aino serves as the off-field healer and energy battery for <strong className="text-gray-200">both teams</strong>.
                She provides consistent healing and generates energy particles, making her the cornerstone of both compositions.
                Priority: keep her well-built (ER 180%+, HP 30k+) to support both Zibai's Burst uptime and Flins's sustain.
              </p>
            </div>
          </div>
        </GlowCard>
      </motion.div>
    </motion.div>
  )
}
