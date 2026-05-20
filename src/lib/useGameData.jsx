import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import {
  getChecklist, setChecklist,
  getTodos, addTodo as storageAddTodo, updateTodo as storageUpdateTodo, deleteTodo as storageDeleteTodo,
  getNotes, setNotes,
  logActivity,
  DEFAULT_CHECKLIST,
  syncFromCloud,
} from './storage'
import { CHARACTERS, CHARACTER_ORDER } from '../data/characters'

const GameDataContext = createContext(null)

export function GameDataProvider({ children }) {
  const [checklists, setChecklists] = useState({})
  const [todos, setTodos] = useState({})
  const [notes, setNotes_state] = useState({})
  const [initialized, setInitialized] = useState(false)

  // Load data from localStorage (after optional cloud pull)
  const loadLocal = useCallback(() => {
    const cls = {}
    const tds = {}
    const nts = {}
    Object.keys(CHARACTERS).forEach(id => {
      cls[id] = getChecklist(id)
      tds[id] = getTodos(id)
      nts[id] = getNotes(id)
    })
    setChecklists(cls)
    setTodos(tds)
    setNotes_state(nts)
  }, [])

  // On startup: pull from Supabase first, then load local
  useEffect(() => {
    async function init() {
      await syncFromCloud()
      loadLocal()
      setInitialized(true)
    }
    init()
  }, [])

  // Re-sync whenever the tab/window regains focus (switching back from another device/tab)
  useEffect(() => {
    async function onFocus() {
      const synced = await syncFromCloud()
      if (synced) loadLocal()
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [loadLocal])

  const updateChecklist = useCallback((charId, field, value) => {
    setChecklists(prev => {
      const updated = { ...prev[charId], [field]: value }
      setChecklist(charId, updated)
      logActivity(charId, 'checklist', `Updated ${field} for ${CHARACTERS[charId]?.name || charId}`)
      return { ...prev, [charId]: updated }
    })
  }, [])

  const addTodo = useCallback((charId, todoObj) => {
    const updated = storageAddTodo(charId, todoObj)
    setTodos(prev => ({ ...prev, [charId]: updated }))
  }, [])

  const toggleTodo = useCallback((charId, id) => {
    setTodos(prev => {
      const todo = prev[charId]?.find(t => t.id === id)
      const updated = storageUpdateTodo(charId, id, { completed: !todo?.completed })
      logActivity(charId, 'todo', `${todo?.completed ? 'Unchecked' : 'Completed'} task for ${CHARACTERS[charId]?.name || charId}`)
      return { ...prev, [charId]: updated }
    })
  }, [])

  const deleteTodo = useCallback((charId, id) => {
    const updated = storageDeleteTodo(charId, id)
    setTodos(prev => ({ ...prev, [charId]: updated }))
  }, [])

  const updateTodoItem = useCallback((charId, id, updates) => {
    const updated = storageUpdateTodo(charId, id, updates)
    setTodos(prev => ({ ...prev, [charId]: updated }))
  }, [])

  const updateNotes = useCallback((charId, field, value) => {
    setNotes_state(prev => {
      const updated = { ...prev[charId], [field]: value }
      setNotes(charId, updated)
      return { ...prev, [charId]: updated }
    })
  }, [])

  const buildScore = useCallback((charId) => {
    const cl = checklists[charId] || DEFAULT_CHECKLIST
    let score = 0
    if (cl.weapon_tier === 'bis') score += 2
    else if (cl.weapon_tier === 'bp') score += 1
    else if (cl.weapon_tier === 'f2p') score += 0.5
    const pieces = ['flower', 'feather', 'sands', 'goblet', 'circlet']
    const equipped = pieces.filter(p => cl[p]).length
    score += equipped * 0.6
    if (cl.stat_goal_1) score += 0.5
    if (cl.stat_goal_2) score += 0.5
    if (cl.stat_goal_3) score += 0.5
    if (cl.skill_talent) score += 0.3
    if (cl.burst_talent) score += 0.3
    return Math.min(9, Math.round(score * 10) / 10)
  }, [checklists])

  const buildProgress = useCallback((charId) => {
    const cl = checklists[charId] || DEFAULT_CHECKLIST
    let points = 0
    let max = 0

    max += 15
    if (cl.weapon_tier === 'bis') points += 15
    else if (cl.weapon_tier === 'bp') points += 10
    else if (cl.weapon_tier === 'f2p') points += 5

    const pieces = ['flower', 'feather', 'sands', 'goblet', 'circlet']
    pieces.forEach(p => {
      max += 8
      if (cl[p]) points += 8
    })

    pieces.forEach(p => {
      max += 4
      const lv = cl[p + '_lv'] || 0
      points += Math.round((lv / 20) * 4)
    })

    max += 15
    if (cl.stat_goal_1) points += 5
    if (cl.stat_goal_2) points += 5
    if (cl.stat_goal_3) points += 5

    max += 10
    if (cl.skill_talent) points += 5
    if (cl.burst_talent) points += 5

    return max > 0 ? Math.round((points / max) * 100) : 0
  }, [checklists])

  const allBuildProgress = useCallback(() => {
    const result = {}
    Object.keys(CHARACTERS).forEach(id => {
      result[id] = buildProgress(id)
    })
    return result
  }, [buildProgress])

  return (
    <GameDataContext.Provider value={{
      checklists,
      todos,
      notes,
      initialized,
      updateChecklist,
      addTodo,
      toggleTodo,
      deleteTodo,
      updateTodoItem,
      updateNotes,
      buildScore,
      buildProgress,
      allBuildProgress,
    }}>
      {children}
    </GameDataContext.Provider>
  )
}

export function useGameData() {
  const ctx = useContext(GameDataContext)
  if (!ctx) throw new Error('useGameData must be used within GameDataProvider')
  return ctx
}