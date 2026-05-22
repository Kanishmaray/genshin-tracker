import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Users, Target, ChevronLeft, ChevronRight, Menu } from 'lucide-react'
import { CHARACTERS, CHARACTER_ORDER } from '../../data/characters'
import { useGameData } from '../../lib/useGameData'
import ProgressRing from '../common/ProgressRing'

const NAV_LINKS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/teams', label: 'Teams', icon: Users },
  { to: '/priorities', label: 'Priorities', icon: Target },
]

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

function SidebarContent({ collapsed, onToggle }) {
  const { buildProgress } = useGameData()
  const navigate = useNavigate()

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col"
          >
            <span className="font-display text-sm font-semibold tracking-widest text-amber-400">GENSHIN</span>
            <span className="text-xs text-gray-500 tracking-wider">BUILD TRACKER</span>
          </motion.div>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors ml-auto"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-2 space-y-1">
        {NAV_LINKS.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.exact}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                isActive
                  ? 'bg-amber-900/30 text-amber-400'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <link.icon size={18} className="flex-shrink-0" style={isActive ? { filter: 'drop-shadow(0 0 6px #D4A017)' } : {}} />
                {!collapsed && <span className="text-sm font-medium">{link.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Character list */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto px-2 pb-2 min-h-0">
          <div className="px-3 py-2 text-xs text-gray-600 font-semibold uppercase tracking-wider">Characters</div>
          <div className="space-y-0.5">
            {CHARACTER_ORDER.map(id => {
              const char = CHARACTERS[id]
              const progress = buildProgress(id)
              const elemColor = ELEMENT_COLORS[char.element] || '#ffffff'

              return (
                <motion.button
                  key={id}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => navigate(`/character/${id}`)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left hover:bg-white/5 transition-colors group"
                >
                  <ProgressRing
                    progress={progress}
                    color={char.colors.primary}
                    size={28}
                    strokeWidth={2.5}
                    showText={false}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-gray-200 truncate">{char.name}</span>
                      <span className="text-xs font-bold" style={{ color: PRIORITY_COLORS[char.priority] }}>
                        {char.priority}
                      </span>
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
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 56 : 240 }}
        transition={{ duration: 0.2 }}
        className="hidden md:flex flex-col flex-shrink-0 h-full overflow-hidden"
        style={{
          background: 'var(--bg-surface)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <SidebarContent collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      </motion.aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 w-60 z-50 md:hidden"
              style={{ background: 'var(--bg-surface)', borderRight: '1px solid rgba(255,255,255,0.06)' }}
            >
              <SidebarContent collapsed={false} onToggle={() => setMobileOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile header */}
        <div
          className="md:hidden flex items-center gap-3 px-4 py-3 flex-shrink-0"
          style={{ background: 'var(--bg-surface)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-white/5"
          >
            <Menu size={20} />
          </button>
          <span className="font-display text-sm font-semibold tracking-widest text-amber-400">GENSHIN TRACKER</span>
        </div>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>

        {/* Mobile bottom nav */}
        <div
          className="md:hidden flex items-center justify-around px-2 py-2 flex-shrink-0"
          style={{ background: 'var(--bg-surface)', borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          {NAV_LINKS.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.exact}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
                  isActive ? 'text-amber-400' : 'text-gray-500'
                }`
              }
            >
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