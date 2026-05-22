import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import { Calendar, TrendingUp, Target, Trophy, Plus, Trash2, Check } from 'lucide-react'
import { CHARACTERS, TEAMS, TALENT_CALENDAR, CHARACTER_ORDER } from '../data/characters'
import { useGameData } from '../lib/useGameData'
import { getActivityLog, addTodo, deleteTodo, updateTodo, getTodos } from '../lib/storage'
import FloatingParticles from '../components/common/FloatingParticles'
import GlowCard from '../components/common/GlowCard'
import ProgressRing from '../components/common/ProgressRing'
import ElementBadge from '../components/common/ElementBadge'
import CharacterCard from '../components/common/CharacterCard'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function getTodayDayStr() {
  const d = new Date()
  return DAYS[d.getDay() === 0 ? 6 : d.getDay() - 1]
}

function container(delay = 0) {
  return {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay },
  }
}

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
}

const childVariant = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
}

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <GlowCard color={color} className="p-4 flex items-center gap-4">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}18`, border: `1px solid ${color}33` }}
      >
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <div className="text-2xl font-bold" style={{ color }}>{value}</div>
        <div className="text-xs text-gray-500">{label}</div>
        {sub && <div className="text-xs text-gray-600 mt-0.5">{sub}</div>}
      </div>
    </GlowCard>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { allBuildProgress, todos, addTodo: ctxAddTodo, toggleTodo, deleteTodo: ctxDeleteTodo } = useGameData()
  const progress = allBuildProgress()
  const activityLog = useMemo(() => getActivityLog(), [])
  const todayDay = getTodayDayStr()

  const [newTask, setNewTask] = useState('')
  const [taskCharId, setTaskCharId] = useState('zibai')

  const chartData = CHARACTER_ORDER.map(id => ({
    name: CHARACTERS[id].name,
    progress: progress[id] || 0,
    color: CHARACTERS[id].colors.primary,
  }))

  const avgProgress = Math.round(
    Object.values(progress).reduce((a, b) => a + b, 0) / Object.keys(progress).length
  )

  const fullyBuilt = Object.values(progress).filter(p => p >= 80).length
  const inProgress = Object.values(progress).filter(p => p > 0 && p < 80).length

  const allTodos = useMemo(() => {
    const list = []
    Object.keys(CHARACTERS).forEach(cid => {
      const charTodos = todos[cid] || []
      charTodos.filter(t => !t.completed).forEach(t => {
        list.push({ ...t, charId: cid })
      })
    })
    return list.slice(0, 8)
  }, [todos])

  function handleAddTask(e) {
    e.preventDefault()
    if (!newTask.trim()) return
    ctxAddTodo(taskCharId, { text: newTask.trim() })
    setNewTask('')
  }

  const priorityOrder = { S: 0, A: 1, B: 2, C: 3 }
  const sortedChars = CHARACTER_ORDER.sort((a, b) =>
    priorityOrder[CHARACTERS[a].priority] - priorityOrder[CHARACTERS[b].priority]
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-full"
    >
      {/* Hero Header */}
      <div
        className="relative overflow-hidden px-6 py-10"
        style={{
          background: 'linear-gradient(135deg, #1a1208 0%, #0e0b06 50%, #090b0f 100%)',
          borderBottom: '1px solid rgba(212,160,23,0.15)',
        }}
      >
        <FloatingParticles color="#D4A017" count={16} />
        <div className="absolute inset-0 pointer-events-none opacity-10">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute border rounded-full"
              style={{
                width: 80 + i * 60,
                height: 80 + i * 60,
                right: -40 - i * 30,
                top: '50%',
                transform: 'translateY(-50%)',
                borderColor: '#D4A017',
                opacity: 0.3 - i * 0.04,
              }}
            />
          ))}
        </div>
        <motion.div {...container(0.1)} className="relative z-10">
          <div className="flex items-baseline gap-3 mb-1">
            <span className="text-amber-500 text-xs tracking-[0.3em] font-medium uppercase">Traveler's</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-amber-400 mb-1" style={{ textShadow: '0 0 30px #D4A01766' }}>
            Build Tracker
          </h1>
          <p className="text-gray-500 text-sm">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            {' · '}
            <span style={{ color: '#D4A017' }}>Today: {todayDay}</span>
          </p>
        </motion.div>
      </div>

      {/* Roster Card Grid */}
      <div className="px-4 md:px-6 pt-5 pb-1">
        <motion.div {...container(0.05)}>
          <div className="flex items-center gap-2 mb-4">
            <span className="font-display text-xs font-semibold text-gray-500 tracking-[0.2em] uppercase">Roster</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <span className="text-xs text-gray-600">{CHARACTER_ORDER.length} characters</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {CHARACTER_ORDER.map((id, i) => (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 + i * 0.06 }}
              >
                <CharacterCard char={CHARACTERS[id]} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="p-4 md:p-6 space-y-6">
        {/* Stat Cards */}
        <motion.div variants={stagger} initial="initial" animate="animate" className="grid grid-cols-3 gap-3">
          <motion.div variants={childVariant}>
            <StatCard icon={TrendingUp} label="Avg Progress" value={`${avgProgress}%`} color="#D4A017" />
          </motion.div>
          <motion.div variants={childVariant}>
            <StatCard icon={Trophy} label="Well Built" value={fullyBuilt} color="#4ADE80" sub=">=80% done" />
          </motion.div>
          <motion.div variants={childVariant}>
            <StatCard icon={Target} label="In Progress" value={inProgress} color="#60A5FA" />
          </motion.div>
        </motion.div>

        {/* Build Progress Chart + Team Readiness */}
        <div className="grid md:grid-cols-2 gap-4">
          <motion.div {...container(0.2)}>
            <GlowCard color="#D4A017" className="p-4">
              <h2 className="font-display text-sm font-semibold text-gray-300 mb-4 tracking-wider">BUILD PROGRESS</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} layout="vertical" barCategoryGap="30%">
                  <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#9AA3B0', fontSize: 11 }} axisLine={false} tickLine={false} width={52} />
                  <Tooltip
                    formatter={(value) => [`${value}%`, 'Progress']}
                    contentStyle={{ background: '#0e1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#e8eaf0' }}
                  />
                  <Bar dataKey="progress" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </GlowCard>
          </motion.div>

          <motion.div {...container(0.25)} className="space-y-3">
            {Object.values(TEAMS).map(team => {
              const teamProgress = Math.round(
                team.members.reduce((sum, id) => sum + (progress[id] || 0), 0) / team.members.length
              )
              return (
                <GlowCard key={team.id} color={team.color} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-display text-sm font-semibold" style={{ color: team.color }}>{team.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{team.synergy.slice(0, 80)}...</p>
                    </div>
                    <ProgressRing progress={teamProgress} color={team.color} size={44} strokeWidth={3} showText />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {team.members.map(id => (
                      <button
                        key={id}
                        onClick={() => navigate(`/character/${id}`)}
                        className="text-xs px-2 py-1 rounded-full hover:opacity-80 transition-opacity"
                        style={{
                          background: `${CHARACTERS[id].colors.primary}18`,
                          color: CHARACTERS[id].colors.primary,
                          border: `1px solid ${CHARACTERS[id].colors.primary}33`,
                        }}
                      >
                        {CHARACTERS[id].name}
                      </button>
                    ))}
                  </div>
                </GlowCard>
              )
            })}
          </motion.div>
        </div>

        {/* Next Actions + Priority Queue */}
        <div className="grid md:grid-cols-2 gap-4">
          <motion.div {...container(0.3)}>
            <GlowCard color="#60A5FA" className="p-4">
              <h2 className="font-display text-sm font-semibold text-gray-300 mb-3 tracking-wider">NEXT ACTIONS</h2>
              <div className="space-y-2 mb-3">
                {allTodos.length === 0 && (
                  <p className="text-gray-600 text-sm text-center py-3">No pending tasks. Add some below!</p>
                )}
                {allTodos.map(todo => (
                  <div key={todo.id} className="flex items-center gap-2 group">
                    <button
                      onClick={() => ctxDeleteTodo(todo.charId, todo.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-gray-600 hover:text-red-400"
                    >
                      <Trash2 size={12} />
                    </button>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full"
                      style={{
                        background: `${CHARACTERS[todo.charId]?.colors.primary}18`,
                        color: CHARACTERS[todo.charId]?.colors.primary,
                      }}
                    >
                      {CHARACTERS[todo.charId]?.name}
                    </span>
                    <span className="text-sm text-gray-300 flex-1 truncate">{todo.text}</span>
                  </div>
                ))}
              </div>
              <form onSubmit={handleAddTask} className="flex gap-2 mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <select
                  value={taskCharId}
                  onChange={e => setTaskCharId(e.target.value)}
                  className="text-xs rounded-lg px-2 py-1.5 bg-white/5 border border-white/10 text-gray-300 focus:outline-none focus:border-blue-400/50"
                >
                  {CHARACTER_ORDER.map(id => (
                    <option key={id} value={id}>{CHARACTERS[id].name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Add task..."
                  value={newTask}
                  onChange={e => setNewTask(e.target.value)}
                  className="flex-1 text-sm bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-400/50"
                />
                <button type="submit" className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-400/10 transition-colors">
                  <Plus size={16} />
                </button>
              </form>
            </GlowCard>
          </motion.div>

          <motion.div {...container(0.35)}>
            <GlowCard color="#FFD700" className="p-4">
              <h2 className="font-display text-sm font-semibold text-gray-300 mb-3 tracking-wider">PRIORITY QUEUE</h2>
              <div className="space-y-2">
                {sortedChars.map(id => {
                  const char = CHARACTERS[id]
                  const p = progress[id] || 0
                  const PCOLORS = { S: '#FFD700', A: '#C084FC', B: '#60A5FA', C: '#6B7280' }
                  return (
                    <button
                      key={id}
                      onClick={() => navigate(`/character/${id}`)}
                      className="w-full flex items-center gap-3 py-1.5 hover:bg-white/5 rounded-lg px-2 transition-colors group"
                    >
                      <span className="text-xs font-bold w-4" style={{ color: PCOLORS[char.priority] }}>{char.priority}</span>
                      <span className="text-sm text-gray-300 flex-1 text-left">{char.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${p}%`, background: char.colors.primary }} />
                        </div>
                        <span className="text-xs text-gray-500 w-8 text-right">{p}%</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </GlowCard>
          </motion.div>
        </div>

        {/* Talent Calendar */}
        <motion.div {...container(0.4)}>
          <GlowCard color="#5EEAD4" className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={16} className="text-teal-400" />
              <h2 className="font-display text-sm font-semibold text-gray-300 tracking-wider">TALENT CALENDAR</h2>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {DAYS.map((day, i) => {
                const chars = TALENT_CALENDAR[day] || []
                const isToday = day === todayDay
                return (
                  <div
                    key={day}
                    className="rounded-xl p-2 text-center"
                    style={{
                      background: isToday ? 'rgba(212,160,23,0.12)' : 'rgba(255,255,255,0.03)',
                      border: isToday ? '1px solid rgba(212,160,23,0.4)' : '1px solid rgba(255,255,255,0.06)',
                      boxShadow: isToday ? '0 0 16px rgba(212,160,23,0.15)' : 'none',
                    }}
                  >
                    <div className={`text-xs font-bold mb-1.5 ${isToday ? 'text-amber-400' : 'text-gray-500'}`}>{day}</div>
                    <div className="space-y-1">
                      {chars.slice(0, day === 'Sun' ? 7 : 4).map(id => (
                        <button key={id} onClick={() => navigate(`/character/${id}`)} className="w-full text-center hover:opacity-80 transition-opacity" title={CHARACTERS[id]?.name}>
                          <div
                            className="w-5 h-5 rounded-full mx-auto flex items-center justify-center text-xs font-bold"
                            style={{ background: CHARACTERS[id]?.colors.primary + '22', color: CHARACTERS[id]?.colors.primary, border: `1px solid ${CHARACTERS[id]?.colors.primary}44`, fontSize: 8 }}
                          >
                            {CHARACTERS[id]?.name.slice(0, 2).toUpperCase()}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </GlowCard>
        </motion.div>

        {/* Artifact Health Grid */}
        <motion.div {...container(0.45)}>
          <GlowCard color="#C084FC" className="p-4">
            <h2 className="font-display text-sm font-semibold text-gray-300 mb-4 tracking-wider">ARTIFACT HEALTH</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="text-left text-gray-500 pb-2 pr-3 font-medium">Character</th>
                    {['Flower', 'Feather', 'Sands', 'Goblet', 'Circlet'].map(p => (
                      <th key={p} className="text-gray-500 pb-2 px-1 font-medium text-center">{p.slice(0,3)}</th>
                    ))}
                    <th className="text-gray-500 pb-2 pl-2 font-medium">Avg</th>
                  </tr>
                </thead>
                <tbody>
                  {CHARACTER_ORDER.map(id => {
                    const char = CHARACTERS[id]
                    const savedCl = (() => { try { return JSON.parse(localStorage.getItem('genshin_tracker_checklist_' + id) || '{}') } catch { return {} } })()
                    const pieces = ['flower', 'feather', 'sands', 'goblet', 'circlet']
                    const levels = pieces.map(p => savedCl[p + '_lv'] || 0)
                    const avg = Math.round(levels.reduce((a, b) => a + b, 0) / pieces.length)
                    function levelColor(lv) {
                      if (lv >= 20) return '#4ADE80'
                      if (lv >= 16) return '#A78BFA'
                      if (lv >= 12) return '#60A5FA'
                      if (lv >= 8) return '#D4A017'
                      if (lv >= 4) return '#FB923C'
                      return 'rgba(255,255,255,0.08)'
                    }
                    return (
                      <tr key={id} className="border-t border-white/[0.04]">
                        <td className="py-2 pr-3 font-medium" style={{ color: char.colors.primary }}>{char.name}</td>
                        {pieces.map(p => {
                          const lv = savedCl[p + '_lv'] || 0
                          return (
                            <td key={p} className="px-1 text-center">
                              <div className="w-6 h-6 rounded-md mx-auto flex items-center justify-center text-xs font-bold" style={{ background: levelColor(lv), color: lv > 0 ? '#000' : 'transparent' }}>
                                {lv > 0 ? lv : ''}
                              </div>
                            </td>
                          )
                        })}
                        <td className="pl-2 text-gray-400 font-medium">+{avg}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <div className="flex items-center gap-3 mt-3 pt-3 text-xs text-gray-600" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                {[{ color: 'rgba(255,255,255,0.08)', label: '+0' }, { color: '#FB923C', label: '+4' }, { color: '#D4A017', label: '+8' }, { color: '#60A5FA', label: '+12' }, { color: '#A78BFA', label: '+16' }, { color: '#4ADE80', label: '+20' }].map(item => (
                  <div key={item.label} className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded" style={{ background: item.color }} />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </GlowCard>
        </motion.div>

        {/* Recent Activity */}
        <motion.div {...container(0.5)}>
          <GlowCard color="#FB923C" className="p-4">
            <h2 className="font-display text-sm font-semibold text-gray-300 mb-3 tracking-wider">RECENT ACTIVITY</h2>
            <div className="space-y-2">
              {activityLog.length === 0 && (
                <p className="text-gray-600 text-sm text-center py-3">No activity yet. Start tracking your builds!</p>
              )}
              {activityLog.slice(0, 8).map(entry => (
                <div key={entry.id} className="flex items-center gap-3 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: CHARACTERS[entry.charId]?.colors.primary || '#fff' }} />
                  <span className="text-gray-400 flex-1 truncate">{entry.description}</span>
                  <span className="text-gray-600 text-xs flex-shrink-0">{new Date(entry.timestamp).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </GlowCard>
        </motion.div>
      </div>
    </motion.div>
  )
}
