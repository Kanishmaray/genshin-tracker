const PREFIX = 'genshin_tracker_'

function getKey(key) {
  return PREFIX + key
}

function getItem(key, fallback = null) {
  try {
    const raw = localStorage.getItem(getKey(key))
    if (raw === null) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function setItem(key, value) {
  try {
    localStorage.setItem(getKey(key), JSON.stringify(value))
  } catch (e) {
    console.warn('Storage error:', e)
  }
}

export const DEFAULT_CHECKLIST = {
  weapon_tier: 'none',
  flower: false,
  feather: false,
  sands: false,
  goblet: false,
  circlet: false,
  flower_lv: 0,
  feather_lv: 0,
  sands_lv: 0,
  goblet_lv: 0,
  circlet_lv: 0,
  stat_goal_1: false,
  stat_goal_2: false,
  stat_goal_3: false,
  skill_talent: false,
  burst_talent: false,
  char_level: 1,
  const_current: 0,
  const_goal: 0,
}

export function getChecklist(charId) {
  return getItem('checklist_' + charId, { ...DEFAULT_CHECKLIST })
}

export function setChecklist(charId, data) {
  setItem('checklist_' + charId, data)
}

export function getTodos(charId) {
  return getItem('todos_' + charId, [])
}

export function addTodo(charId, todoObj) {
  const todos = getTodos(charId)
  todos.push({
    id: Date.now().toString(),
    text: '',
    completed: false,
    scheduledFor: null,
    resourceType: null,
    resourceTarget: null,
    resourceCurrent: null,
    createdAt: new Date().toISOString(),
    ...todoObj,
  })
  setItem('todos_' + charId, todos)
  return todos
}

export function updateTodo(charId, id, updates) {
  const todos = getTodos(charId)
  const idx = todos.findIndex(t => t.id === id)
  if (idx !== -1) {
    todos[idx] = { ...todos[idx], ...updates }
    setItem('todos_' + charId, todos)
  }
  return todos
}

export function deleteTodo(charId, id) {
  const todos = getTodos(charId).filter(t => t.id !== id)
  setItem('todos_' + charId, todos)
  return todos
}

export function getNotes(charId) {
  return getItem('notes_' + charId, { general: '', plans: '' })
}

export function setNotes(charId, data) {
  setItem('notes_' + charId, data)
}

export function getActivityLog() {
  return getItem('activity_log', [])
}

export function logActivity(charId, type, description) {
  const log = getActivityLog()
  log.unshift({
    id: Date.now().toString(),
    charId,
    type,
    description,
    timestamp: new Date().toISOString(),
  })
  // Keep only last 20
  const trimmed = log.slice(0, 20)
  setItem('activity_log', trimmed)
  return trimmed
}

export function getUpcomingEvents() {
  return getItem('upcoming_events', [])
}

export function addUpcomingEvent(event) {
  const events = getUpcomingEvents()
  events.push({
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    ...event,
  })
  setItem('upcoming_events', events)
  return events
}

export function updateUpcomingEvent(id, updates) {
  const events = getUpcomingEvents()
  const idx = events.findIndex(e => e.id === id)
  if (idx !== -1) {
    events[idx] = { ...events[idx], ...updates }
    setItem('upcoming_events', events)
  }
  return events
}

export function deleteUpcomingEvent(id) {
  const events = getUpcomingEvents().filter(e => e.id !== id)
  setItem('upcoming_events', events)
  return events
}
