import supabase from './supabase.js'

const PREFIX = 'genshin_tracker_'

// Fixed sync identity — all devices share this single ID automatically.
// No sync code entry needed.
const SYNC_ID = 'KANISHMARAY'

// ─── Core localStorage helpers ───────────────────────────────────────────────

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
    pushToCloud(key, value) // fire-and-forget
  } catch (e) {
    console.warn('Storage error:', e)
  }
}

// ─── Supabase sync ───────────────────────────────────────────────────────────

async function pushToCloud(key, value) {
  if (!supabase) return
  try {
    await supabase
      .from('character_progress')
      .upsert(
        { device_id: SYNC_ID, character_id: key, data: value, updated_at: new Date().toISOString() },
        { onConflict: 'device_id,character_id' }
      )
  } catch (e) {
    console.warn('Supabase push error:', e)
  }
}

// Pull all data for SYNC_ID from Supabase into localStorage.
// Returns true if any data was loaded, false otherwise.
export async function syncFromCloud() {
  if (!supabase) return false
  try {
    const { data, error } = await supabase
      .from('character_progress')
      .select('character_id, data')
      .eq('device_id', SYNC_ID)

    if (error || !data || data.length === 0) return false

    for (const row of data) {
      localStorage.setItem(PREFIX + row.character_id, JSON.stringify(row.data))
    }
    return true
  } catch (e) {
    console.warn('Supabase pull error:', e)
    return false
  }
}

// ─── Checklist ───────────────────────────────────────────────────────────────

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

// ─── Todos ───────────────────────────────────────────────────────────────────

export function getTodos(charId) {
  const todos = getItem('todos_' + charId, [])
  const TEN_DAYS_MS = 10 * 24 * 60 * 60 * 1000
  const now = Date.now()
  // Auto-purge completed todos that were marked done more than 10 days ago
  const filtered = todos.filter(t => {
    if (t.completed && t.completedAt) {
      return now - new Date(t.completedAt).getTime() < TEN_DAYS_MS
    }
    return true
  })
  if (filtered.length !== todos.length) {
    // Something was purged — persist the trimmed list without triggering another cloud push loop
    try { localStorage.setItem(getKey('todos_' + charId), JSON.stringify(filtered)) } catch {}
  }
  return filtered
}

export function addTodo(charId, todoObj) {
  const todos = getTodos(charId)
  todos.push({
    id: Date.now().toString(),
    text: '',
    completed: false,
    completedAt: null,
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
    // Stamp completedAt when marking done; clear it when un-completing
    if ('completed' in updates) {
      if (updates.completed && !todos[idx].completedAt) {
        updates = { ...updates, completedAt: new Date().toISOString() }
      } else if (!updates.completed) {
        updates = { ...updates, completedAt: null }
      }
    }
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

// ─── Notes ───────────────────────────────────────────────────────────────────

export function getNotes(charId) {
  return getItem('notes_' + charId, { general: '', plans: '' })
}

export function setNotes(charId, data) {
  setItem('notes_' + charId, data)
}

// ─── Activity log ─────────────────────────────────────────────────────────────

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
  const trimmed = log.slice(0, 20)
  setItem('activity_log', trimmed)
  return trimmed
}

// ─── Upcoming events ─────────────────────────────────────────────────────────

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
