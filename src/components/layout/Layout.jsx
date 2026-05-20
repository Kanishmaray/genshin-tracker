import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Users, Target, ChevronLeft, ChevronRight, Menu, RefreshCw, Copy, Check } from 'lucide-react'
import { CHARACTERS, CHARACTER_ORDER } from '../../data/characters'
import { useGameData } from '../../lib/useGameData'
import ProgressRing from '../common/ProgressRing'

const NAV_LINKS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/teams', label: 'Teams', icon: Users },
  { to: '/priorities', label: 'Priorities', icon: Target },
]

const ELEMENT_COLORS = {
  Geo: '#D4A017', Electro: '#A855F7', Anemo: '#2DD4BF',
  Hydro: '#38BDF8', Pyro: '#FB923C', Cryo: '#94A3B8', Dendro: '#4ADE80',
}

const PRIORITY_COLORS = { S: '#FFD700', A: '#C084FC', B: '#60A5FA', C: '#6B7280' }

function SyncPanel({ collapsed }) {
  const { syncId, syncing, doSync } = useGameData()
  const [input, setInput] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  if (collapsed) return (
    <div className="px-2 py-2 border-b flex justify-center" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
      <button onClick={() => doSync()} disabled={syncing} title="Sync"
        className="p-1.5 rounded-lg text-gray-500 hover:text-amber-400 hover:bg-white/5 transition-colors">
        <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
      </button>
    </div>
  )

  const handleCopy = () => {
    navigator.clipboard.writeText(syncId).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleImport = async () => {
    if (!input.trim()) return
    setError('')
    setSuccess('')
    const ok = await doSync(input.trim())
    if (ok) { setSuccess('Synced!'); setInput(''); setTimeout(() => setSuccess(''), 3000) }
    else setError('Code not found.')
  }

  return (
    <div className="px-3 py-2 border-b space-y-1.5" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
      <div className="text-xs text-gray-600 font-semibold uppercase tracking-wider">Sync Code</div>
      <div className="flex items-center gap-1.5">
        <span className="flex-1 text-xs font-mono text-amber-400 bg-amber-900/20 px-2 py-1 rounded truncate">{syncId}</span>
        <button onClick={handleCopy} className="p-1 rounded text-gray-400 hover:text-amber-400 transition-colors flex-shrink-0">
          {copied ? <Check size={13} /> : <Copy size={13} />}
        </button>
        <button onClick={() => doSync()} disabled={syncing}
          className="p-1 rounded text-gray-400 hover:text-amber-400 transition-colors flex-shrink-0" title="Pull latest">
          <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
        </button>
      </div>
      <div className="flex gap-1">
        <input value={input} onChange={e => setInput(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && handleImport()}
          placeholder="Enter code to sync…" maxLength={16}
          className="flex-1 text-xs bg-white/5 border rounded px-2 py-1 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-amber-700"
          style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
        <button onClick={handleImport} disabled={syncing || !input.trim()}
          className="text-xs px-2 py-1 rounded bg-amber-900/40 text-amber-400 hover:bg-amber-900/60 disabled:opacity-40 transition-colors">
          Use
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {success && <p className="text-xs text-green-400">{success}</p>}
    </div>
  )
}

function SidebarContent({ collapsed, onToggle }) {
  const { buildProgress } = useGameData()
  const navigate = useNavigate()

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col">
            <span className="font-display text-sm font-semibold tracking-widest text-amber-400">GENSHIN</span>
            <span className="text-xs text-gray-500 tracking-wider">BUILD TRACKER</span>
          </motion.div>
        )}
        <button onClick={onToggle}
          className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors ml-auto">
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="p-2 space-y-1">
        {NAV_LINKS.map(link => (
          <NavLink key={link.to} to={link.to} end={link.exact}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive ? 'bg-amber-900/30 text-amber-400' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}>
            {({ isActive }) => (
              <>
                <link.icon size={18} className="flex-shrink-0" style={isActive ? { filter: 'drop-shadow(0 0 6px #D4A017)' } : {}} />
                {!collapsed && <span className="text-sm font-medium">{link.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <SyncPanel collapsed={collapsed} />

      {!collapsed && (
        <div className="flex-1 overflow-y-auto px-2 pb-2 min-h-0">
          <div className="px-3 py-2 text-xs text-gray-600 font-semibold uppercase tracking-wider">Characters</div>
          <div className="space-y-0.5">
            {CHARACTER_ORDER.map(id => {
              const char = CHARACTERS[id]
              const progress = buildProgress(id)
              const elemColor = ELEMENT_COLORS[char.element] || '#ffffff'
              return (
                <motion.button key={id} whileHover={{ scale: 1.01 }}
                  onClick={() => navigate(`/character/${id}`)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left hover:bg-white/5 transition-colors group">
                  <ProgressRing progress={progress} color={char.colors.primary} size={28} strokeWidth={2.5} showText={false} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-gray-200 truncate">{char.name}</span>
                      <span className="text-xs font-bold" style={{ color: PRIORITY_COLORS[char.priority] }}>{char.priority}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: elemColor }} />
                      <span className="text-xs text-gray-500 truncate">{char.element} · {progress}%</span>
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      <motion.aside animate={{ width: collapsed ? 56 : 240 }} transition={{ duration: 0.2 }}
        className="hidden md:flex flex-col flex-shrink-0 h-full overflow-hidden"
        style={{ background: 'var(--bg-surface)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        <SidebarContent collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      </motion.aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
            <motion.div initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 w-60 z-50 md:hidden"
              style={{ background: 'var(--bg-surface)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
              <SidebarContent collapsed={false} onToggle={() => setMobileOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="md:hidden flex items-center gap-3 px-4 py-3 flex-shrink-0"
          style={{ background: 'var(--bg-surface)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-white/5">
            <Menu size={20} />
          </button>
          <span className="font-display text-sm font-semibold tracking-widest text-amber-400">GENSHIN TRACKER</span>
        </div>

        <main className="flex-1 overflow-y-auto">{children}</main>

        <div className="md:hidden flex items-center justify-around px-2 py-2 flex-shrink-0"
          style={{ background: 'var(--bg-surface)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {NAV_LINKS.map(link => (
            <NavLink key={link.to} to={link.to} end={link.exact}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${isActive ? 'text-amber-400' : 'text-gray-500'}`}>
              {({ isActive }) => (
                <>
                  <link.icon size={20} style={isActive ? { filter: 'drop-shadow(0 0 6px #D4A017)' } : {}} />
                  <span className="text-xs">{link.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  )
}